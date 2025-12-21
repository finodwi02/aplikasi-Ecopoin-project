package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/cloudinary/cloudinary-go/v2"
	"github.com/cloudinary/cloudinary-go/v2/api/uploader"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

// --- STRUKTUR DATA ---
type User struct {
	ID          uint   `json:"id" gorm:"primaryKey"`
	Name        string `json:"name"`
	Email       string `json:"email" gorm:"unique"`
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

func ConnectDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "root:@tcp(127.0.0.1:3306)/ecopoint_db?charset=utf8mb4&parseTime=True&loc=Local"
	}

	database, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Gagal koneksi ke database:", err)
	}
	DB = database
	DB.AutoMigrate(&User{}, &Activity{}, &WeeklyTask{}, &UserTaskProgress{})
	
	// Seed data jika kosong
	var count int64
	DB.Model(&WeeklyTask{}).Count(&count)
	if count < 1 {
		tasks := []WeeklyTask{
			{Title: "Bawa Botol Minum Sendiri", Points: 30, TargetCount: 5},
			{Title: "Belanja Pakai Tas Kain", Points: 40, TargetCount: 2},
			{Title: "Tolak Sedotan Plastik", Points: 20, TargetCount: 3},
			{Title: "Makan Tanpa Daging", Points: 150, TargetCount: 1},
			{Title: "Naik Transportasi Umum", Points: 60, TargetCount: 2},
		}
		DB.Create(&tasks)
	}
}

// FUNGSI UPLOAD KE CLOUDINARY
func uploadToCloudinary(file interface{}, filename string) (string, error) {
	// Ambil URL Cloudinary dari Env Var
	cldURL := os.Getenv("CLOUDINARY_URL")
	if cldURL == "" {
		// Jika tidak ada setting Cloudinary, kembalikan string kosong (atau handle error)
		return "", fmt.Errorf("CLOUDINARY_URL tidak ditemukan")
	}

	// Buat instance Cloudinary
	cld, err := cloudinary.NewFromURL(cldURL)
	if err != nil {
		return "", err
	}

	// Upload File
	ctx := context.Background()
	resp, err := cld.Upload.Upload(ctx, file, uploader.UploadParams{
		PublicID: filename,
		Folder:   "ecopoint_uploads",
	})
	if err != nil {
		return "", err
	}

	// Kembalikan URL Aman (HTTPS)
	return resp.SecureURL, nil
}

// --- CONTROLLERS ---

func Register(c *gin.Context) {
	var input User
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	var cekUser User
	if err := DB.Where("email = ?", input.Email).First(&cekUser).Error; err == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Email sudah terdaftar!"})
		return
	}
	input.TotalPoints = 0
	DB.Create(&input)
	c.JSON(http.StatusOK, gin.H{"message": "Pendaftaran Berhasil!", "user": input})
}

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

	// --- PROSES UPLOAD GAMBAR BARU ---
	photoPath := ""
	file, err := c.FormFile("photo")
	if err == nil {
		// Jika ada file, upload ke Cloudinary
		filename := fmt.Sprintf("%d_%s", time.Now().Unix(), "activity") // Nama file unik
		
		// Buka file untuk dibaca
		openedFile, _ := file.Open()
		defer openedFile.Close()

		// Kirim ke Cloudinary
		uploadedURL, err := uploadToCloudinary(openedFile, filename)
		if err == nil {
			photoPath = uploadedURL // Gunakan URL dari Cloudinary
		} else {
			log.Println("Gagal upload ke Cloudinary:", err)
			// Fallback: Jika gagal, kosongkan atau pakai placeholder
			photoPath = "" 
		}
	}
	// ---------------------------------

	points := 0
	isWeeklyTask := false
	var task WeeklyTask

	if taskIDStr != "" {
		if taskID, err := strconv.ParseUint(taskIDStr, 10, 32); err == nil {
			if err := DB.First(&task, uint(taskID)).Error; err == nil {
				points = task.Points
				isWeeklyTask = true
			}
		}
	}

	if !isWeeklyTask {
		switch category {
		case "Menanam Pohon": points = 50
		case "Daur Ulang Sampah": points = 20
		case "Hemat Energi": points = 15
		case "Transportasi Hijau": points = 30
		default: points = 10
		}
	}

	activity := Activity{
		UserID:       uint(userID),
		Category:     category,
		Description:  desc,
		PhotoURL:     photoPath,
		PointsEarned: points,
	}
	DB.Create(&activity)

	if isWeeklyTask {
		year, week := time.Now().ISOWeek()
		var prog UserTaskProgress
		err := DB.Where("user_id = ? AND task_id = ?", uint(userID), task.ID).First(&prog).Error
		
		if err != nil || prog.Week != week || prog.Year != year {
			if err == nil { DB.Delete(&prog) }
			prog = UserTaskProgress{UserID: uint(userID), TaskID: task.ID, Week: week, Year: year, IsDone: true}
			DB.Create(&prog)
		} else if !prog.IsDone {
			prog.IsDone = true
			DB.Save(&prog)
		}
	}

	if points > 0 {
		DB.Model(&User{}).Where("id = ?", uint(userID)).
			UpdateColumn("total_points", gorm.Expr("total_points + ?", points))
	}

	c.JSON(http.StatusOK, gin.H{
		"message": fmt.Sprintf("Berhasil! +%d Poin", points),
		"points":  points,
	})
}

func GetUserProfile(c *gin.Context) {
	userID := c.Query("user_id")
	var user User
	if err := DB.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User tidak ditemukan"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"data": user})
}

func DeleteActivity(c *gin.Context) {
	id := c.Param("id")
	var activity Activity
	if err := DB.First(&activity, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Data tidak ditemukan"})
		return
	}
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
	// (Kode RedeemReward sama seperti sebelumnya, disingkat agar muat)
	c.JSON(http.StatusOK, gin.H{"message": "Fitur redeem"})
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
		if err == nil && prog.Year == year && prog.Week == week {
			isDone = prog.IsDone
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

	// Route
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

	port := os.Getenv("PORT")
	if port == "" { port = "8080" }
	log.Println("Server Backend berjalan di port " + port)
	r.Run(":" + port)
}