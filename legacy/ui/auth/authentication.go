package auth

import (
	"errors"
	"i_was_here/cmd/api"
	"i_was_here/session"

	"golang.org/x/crypto/bcrypt"
)

func RegisterUser(name, email, password, confirmPassword string) error {
	// Check if passwords match
	if password != confirmPassword {
		return errors.New("passwords do not match")
	}

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

	err = bcrypt.CompareHashAndPassword(hashedPassword, []byte(password))
	if err != nil {
		return err
	}

	// Set the current user's session
	session.CurrentUser = &session.UserSession{
		Email: email,
		// You can fetch the user's name from the database if needed
	}

	return nil
}

func LogoutUser() error {
	session.CurrentUser = nil
	return nil
}

func UpdateUserProfile(user *session.UserSession, name, email, password string) error {
	// Check if the email already exists
	if api.EmailExists(email) {
		return errors.New("email already in use")
	} else if api.NameExists(name) {
		return errors.New("name already in use")
	}

	if name == "" {
		name = user.Name
	}

	if email == "" {
		email = user.Email
	}

	var hashedPassword []byte
	var err error

	if password != "" {
		hashedPassword, err = bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		if err != nil {
			return err
		}
	} else {
		hashedPassword = nil
	}

	return api.UpdateRegistrationData(user.Email, name, email, hashedPassword)
}
