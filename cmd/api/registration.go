package api

import (
	"fmt"
	"log"

	database "i_was_here/cmd/database"

	_ "github.com/mattn/go-sqlite3"
)

func StoreRegistrationData(name, email string, hashedPassword []byte) error {
	var DB = database.DB

	tx, err := DB.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback() // Rollback if the transaction is not committed

	_, err = tx.Exec("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", name, email, hashedPassword)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	fmt.Println("Registration data stored successfully")
	return nil
}

func EmailExists(email string) bool {
	var DB = database.DB

	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE email = ?", email).Scan(&count)
	if err != nil {
		log.Println("Error checking email existence:", err)
		return false
	}

	return count > 0
}

func NameExists(name string) bool {
	var DB = database.DB

	var count int
	err := DB.QueryRow("SELECT COUNT(*) FROM users WHERE name = ?", name).Scan(&count)
	if err != nil {
		log.Println("Error checking name existence:", err)
		return false
	}

	return count > 0
}
