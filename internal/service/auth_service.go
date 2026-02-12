package service

import (
	"crypto/rand"
	"encoding/hex"
	"errors"
	"time"

	"tinyauth-usermanagement/internal/config"
	"tinyauth-usermanagement/internal/store"

	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	cfg   config.Config
	store *store.Store
	users *UserFileService
}

func NewAuthService(cfg config.Config, st *store.Store, users *UserFileService) *AuthService {
	return &AuthService{cfg: cfg, store: st, users: users}
}

func (s *AuthService) Login(username, password string) (string, error) {
	u, ok, err := s.users.Find(username)
	if err != nil {
		return "", err
	}
	if !ok {
		return "", errors.New("invalid credentials")
	}
	if bcrypt.CompareHashAndPassword([]byte(u.Password), []byte(password)) != nil {
		return "", errors.New("invalid credentials")
	}

	token, err := randomToken(32)
	if err != nil {
		return "", err
	}
	now := time.Now().Unix()
	expires := now + s.cfg.SessionTTLSeconds
	if err := s.store.CreateSession(token, u.Username, now, expires); err != nil {
		return "", err
	}
	return token, nil
}

func (s *AuthService) Logout(token string) error {
	return s.store.DeleteSession(token)
}

func (s *AuthService) SessionUsername(token string) (string, error) {
	username, expiresAt, err := s.store.GetSession(token)
	if err != nil {
		return "", err
	}
	if username == "" {
		return "", errors.New("unauthorized")
	}
	if time.Now().Unix() > expiresAt {
		_ = s.store.DeleteSession(token)
		return "", errors.New("unauthorized")
	}
	return username, nil
}

func HashPassword(password string) (string, error) {
	b, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(b), nil
}

func randomToken(size int) (string, error) {
	buf := make([]byte, size)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf), nil
}
