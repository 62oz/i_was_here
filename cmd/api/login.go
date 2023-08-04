package api

import database "i_was_here/cmd/database"

func GetPasswordForEmail(email string) ([]byte, error) {
	var DB = database.DB

	row := DB.QueryRow("SELECT password FROM users WHERE email = ?", email)

	var password []byte
	err := row.Scan(&password)
	if err != nil {
		return nil, err
	}

	return password, nil
}
