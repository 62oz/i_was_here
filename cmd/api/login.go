package api

func GetPasswordForEmail(email string) ([]byte, error) {
	row := DB.QueryRow("SELECT password FROM users WHERE email = ?", email)

	var password []byte
	err := row.Scan(&password)
	if err != nil {
		return nil, err
	}

	return password, nil
}
