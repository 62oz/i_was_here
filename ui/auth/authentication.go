package auth

import (
	"errors"
	api "i_was_here/cmd/api"

	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(name, email, password string) error {
	// Check if the email already exists
	if api.EmailExists(email) {
		return errors.New("email already in use")
	} else if api.NameExists(name) {
		return errors.New("name already in use")
	}

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

func LogoutUser() error {
	return nil
}
