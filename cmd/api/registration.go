package api

import (
	"fmt"

	database "i_was_here/cmd/database"

	_ "github.com/mattn/go-sqlite3"
)

var DB = database.DB

func StoreRegistrationData(name, email string, hashedPassword []byte) error {
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
