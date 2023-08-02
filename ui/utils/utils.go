package utils

import (
	"regexp"
)

// validateEmail checks if the provided email address is valid.
func ValidateEmail(email string) bool {
	pattern := `^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$`
	match, _ := regexp.MatchString(pattern, email)
	return match
}

func ValidateName(name string) bool {
	pattern := `^[a-zA-Z0-9._%+-]{2,10}$`
	match, _ := regexp.MatchString(pattern, name)
	return match
}
