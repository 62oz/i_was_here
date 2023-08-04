package session

// UserSession represents the user's session state
type UserSession struct {
	Name  string
	Email string
}

var CurrentUser *UserSession
