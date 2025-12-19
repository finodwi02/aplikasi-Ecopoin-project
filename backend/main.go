package main

import (
	"fmt"
	"log"
	"net/http"
	"path/filepath"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// --- STRUKTUR DATA LENGKAP ---
type User struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Email       string `json:"email" gorm:"unique"` // Email unik
	Password    string `json:"password"`
	Phone       string `json:"phone"`
	TotalPoints int    `json:"total_points"`
}

type Activity struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	UserID       uint      `json:"user_id"`
	Category     string    `json:"category"`
	Description  string    `json:"description"`
	PhotoURL     string    `json:"photo_url"`
	PointsEarned int       `json:"points_earned"`
	CreatedAt    time.Time `json:"created_at"`
}

type WeeklyTask struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Title       string `json:"title"`
	Points      int    `json:"points"`
	TargetCount int    `json:"target_count"`
}

type UserTaskProgress struct {
	ID     uint `gorm:"primaryKey"`
	UserID uint `json:"user_id"`
	TaskID uint `json:"task_id"`
	IsDone bool `json:"is_done"`
	Week   int  `json:"week"`
	Year   int  `json:"year"`
}

var DB *gorm.DB

// --- KONEKSI & SEEDING DATABASE ---
func ConnectDB() {
	dsn := "root:@tcp(127.0.0.1:3306)/ecopoint_db?charset=utf8mb4&parseTime=True&loc=Local"
	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}
	DB = database
	
	// Auto Migrate (Membuat tabel otomatis)
	DB.AutoMigrate(&User{}, &Activity{}, &WeeklyTask{}, &UserTaskProgress{})

	// Cek apakah perlu reset tugas (Jika tugas < 10)
	var count int64
	DB.Model(&WeeklyTask{}).Count(&count)
	if count < 10 {
		log.Println("🔄 Mereset Database Tugas Mingguan...")
		// Matikan Foreign Key Check agar bisa TRUNCATE
		DB.Exec("SET FOREIGN_KEY_CHECKS = 0")
		DB.Exec("TRUNCATE TABLE weekly_tasks")
		DB.Exec("TRUNCATE TABLE user_task_progresses")
		DB.Exec("SET FOREIGN_KEY_CHECKS = 1")

		// Daftar 20 Tugas Baru
		tasks := []WeeklyTask{
			{Title: "Bawa Botol Minum Sendiri", Points: 30, TargetCount: 5},
			{Title: "Belanja Pakai Tas Kain", Points: 40, TargetCount: 2},
			{Title: "Tolak Sedotan Plastik", Points: 20, TargetCount: 3},
			{Title: "Bawa Wadah Makan (Misting)", Points: 50, TargetCount: 3},
			{Title: "Gunakan Saputangan", Points: 30, TargetCount: 5},
			{Title: "Cabut Colokan Tak Terpakai", Points: 20, TargetCount: 7},
			{Title: "Mandi Cepat (< 5 Menit)", Points: 30, TargetCount: 5},
			{Title: "Matikan Lampu Siang Hari", Points: 20, TargetCount: 7},
			{Title: "Hari Tanpa AC/Kipas", Points: 100, TargetCount: 1},
			{Title: "Jemur Pakaian Alami", Points: 40, TargetCount: 1},
			{Title: "Makan Tanpa Daging", Points: 150, TargetCount: 1},
			{Title: "Habiskan Makanan", Points: 30, TargetCount: 7},
			{Title: "Masak Sendiri di Rumah", Points: 50, TargetCount: 3},
			{Title: "Jalan Kaki / Bersepeda", Points: 50, TargetCount: 3},
			{Title: "Naik Transportasi Umum", Points: 60, TargetCount: 2},
			{Title: "Siram Tanaman Air Bekas", Points: 40, TargetCount: 3},
			{Title: "Memilah Sampah Rumah", Points: 50, TargetCount: 7},
			{Title: "Bagikan Aksi di Sosmed", Points: 50, TargetCount: 1},
			{Title: "Hapus 50 Email Spam", Points: 20, TargetCount: 1},
			{Title: "Donasi Barang Bekas", Points: 100, TargetCount: 1},
		}
		DB.Create(&tasks)
		log.Println("✅ 20 Tugas Mingguan Berhasil Ditambahkan!")
	}
}

// --- CONTROLLERS ---

// 1. REGISTER (Penyimpanan Data User Baru)
func Register(c *gin.Context) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Cek Email Kembar
	var cekUser User
	if err := DB.Where("email = ?", input.Email).First(&cekUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar!"})
		return
	}

	input.TotalPoints = 0
	DB.Create(&input)
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran Berhasil!", "user": input})
}

// 2. LOGIN
func Login(c *gin.Context) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data tidak lengkap"})
		return
	}
	var user User
	if err := DB.Where("email = ? AND password = ?", input.Email, input.Password).First(&user).Error; err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Email atau Password salah!"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Login Berhasil", "user_id": user.ID, "name": user.Name})
}

// 3. GET PROFILE (Penting agar poin muncul di Dashboard)
func GetUserProfile(c *gin.Context) {
	userID := c.Query("user_id")
	var user User
	if err := DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": user})
}

// 4. CREATE ACTIVITY (Lapor Aksi + Hitung Poin Misi)
func CreateActivity(c *gin.Context) {
	category := c.PostForm("category")
	desc := c.PostForm("description")
	userIDStr := c.PostForm("user_id")
	taskIDStr := c.PostForm("task_id")

	var userID uint64
	if id, err := strconv.ParseUint(userIDStr, 10, 32); err == nil {
		userID = id
	} else {
		userID = 1
	}

	// Upload Foto
	file, err := c.FormFile("photo")
	photoPath := ""
	if err == nil {
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(file.Filename))
		dst := "./uploads/" + filename
		if err := c.SaveUploadedFile(file, dst); err == nil {
			photoPath = "http://localhost:8080/uploads/" + filename
		}
	}

	// Logika Poin
	points := 0
	isWeeklyTask := false
	var task WeeklyTask

	// Cek apakah Misi Mingguan?
	if taskIDStr != "" {
		if taskID, err := strconv.ParseUint(taskIDStr, 10, 32); err == nil {
			if err := DB.First(&task, uint(taskID)).Error; err == nil {
				points = task.Points // Pakai Poin Misi
				isWeeklyTask = true
			}
		}
	}

	// Jika bukan misi, pakai poin kategori standar
	if !isWeeklyTask {
		switch category {
		case "Menanam Pohon":
			points = 50
		case "Daur Ulang Sampah":
			points = 20
		case "Hemat Energi":
			points = 15
		case "Transportasi Hijau":
			points = 30
		case "Transportasi Ramah Lingkungan":
			points = 30
		default:
			points = 10
		}
	}

	// Simpan Aktivitas
	activity := Activity{
		UserID:       uint(userID),
		Category:     category,
		Description:  desc,
		PhotoURL:     photoPath,
		PointsEarned: points,
	}
	DB.Create(&activity)

	// Update Status Misi (Jika Mingguan)
	missionMessage := ""
	if isWeeklyTask {
		year, week := time.Now().ISOWeek()
		var prog UserTaskProgress
		
		err := DB.Where("user_id = ? AND task_id = ?", uint(userID), task.ID).First(&prog).Error
		
		// Buat baru atau Update jika beda minggu
		if err != nil || prog.Week != week || prog.Year != year {
			if err == nil { DB.Delete(&prog) } // Hapus yang lama biar bersih
			
			prog = UserTaskProgress{UserID: uint(userID), TaskID: task.ID, Week: week, Year: year, IsDone: true}
			DB.Create(&prog)
			missionMessage = " (Misi Selesai!)"
		} else if !prog.IsDone {
			prog.IsDone = true
			DB.Save(&prog)
			missionMessage = " (Misi Selesai!)"
		}
	}

	// Update Total Poin User (Metode Aman: Langsung Update di DB)
	if points > 0 {
		if err := DB.Model(&User{}).Where("id = ?", uint(userID)).
			UpdateColumn("total_points", gorm.Expr("total_points + ?", points)).Error; err != nil {
			log.Println("❌ Gagal update poin:", err)
		} else {
			log.Printf("✅ User %d nambah %d poin. Sumber: %s", userID, points, category)
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Berhasil! +%d Poin%s", points, missionMessage),
		"points":  points,
	})
}

// 5. DELETE ACTIVITY (Hapus & Kurangi Poin)
func DeleteActivity(c *gin.Context) {
	id := c.Param("id")
	var activity Activity
	if err := DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}
	// Kurangi poin user
	DB.Model(&User{}).Where("id = ?", activity.UserID).
		UpdateColumn("total_points", gorm.Expr("total_points - ?", activity.PointsEarned))
	
	DB.Delete(&activity)
	c.JSON(http.StatusOK, gin.H{"message": "Aktivitas dihapus"})
}

func GetLeaderboard(c *gin.Context) {
	var users []User
	DB.Order("total_points desc").Limit(10).Find(&users)
	c.JSON(http.StatusOK, gin.H{"data": users})
}

func GetUserActivities(c *gin.Context) {
	userID := c.Query("user_id")
	var activities []Activity
	DB.Where("user_id = ?", userID).Order("created_at desc").Limit(10).Find(&activities)
	c.JSON(http.StatusOK, gin.H{"data": activities})
}

func RedeemReward(c *gin.Context) {
	type RedeemRequest struct {
		UserID uint `json:"user_id"`
		Cost   int  `json:"cost"`
	}
	var req RedeemRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Data invalid"})
		return
	}
	var user User
	if err := DB.First(&user, req.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	if user.TotalPoints < req.Cost {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Poin tidak cukup!"})
		return
	}
	user.TotalPoints -= req.Cost
	DB.Save(&user)
	c.JSON(http.StatusOK, gin.H{"message": "Berhasil ditukar!", "sisa_poin": user.TotalPoints})
}

func GetWeeklyTasks(c *gin.Context) {
	userID := c.Query("user_id")
	year, week := time.Now().ISOWeek()
	var tasks []WeeklyTask
	DB.Find(&tasks)
	var response []gin.H
	for _, t := range tasks {
		var prog UserTaskProgress
		err := DB.Where("user_id = ? AND task_id = ?", userID, t.ID).First(&prog).Error
		isDone := false
		if err == nil {
			if prog.Year == year && prog.Week == week {
				isDone = prog.IsDone
			} else {
				// Reset status di DB jika minggu berganti
				prog.IsDone = false; prog.Week = week; prog.Year = year; DB.Save(&prog)
			}
		}
		response = append(response, gin.H{"id": t.ID, "title": t.Title, "points": t.Points, "is_done": isDone})
	}
	c.JSON(http.StatusOK, gin.H{"data": response})
}

func CompleteTask(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Gunakan fitur lapor aktivitas"})
}

func main() {
	ConnectDB()
	r := gin.Default()
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	r.Use(cors.New(config))
	r.Static("/uploads", "./uploads")

	// DAFTAR ROUTE
	r.POST("/api/register", Register)
	r.POST("/api/login", Login)
	r.GET("/api/user", GetUserProfile)
	r.POST("/api/activity", CreateActivity)
	r.DELETE("/api/activity/:id", DeleteActivity)
	r.GET("/api/leaderboard", GetLeaderboard)
	r.GET("/api/user-activities", GetUserActivities)
	r.POST("/api/redeem", RedeemReward)
	r.GET("/api/weekly-tasks", GetWeeklyTasks)
	r.POST("/api/complete-task", CompleteTask)

	log.Println("Server Backend berjalan di http://localhost:8080")
	r.Run(":8080")
}