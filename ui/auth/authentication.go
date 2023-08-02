package auth

import (
	api "i_was_here/cmd/api"

	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(name, email, password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}

	return api.StoreRegistrationData(name, email, hashedPassword)
}

func LoginUser(email, password string) error {
	hashedPassword, err := api.GetPasswordForEmail(email)
	if err != nil {
		return err
	}

	return bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
}
