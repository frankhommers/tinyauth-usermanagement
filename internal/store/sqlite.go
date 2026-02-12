package store

import (
	"database/sql"
	"fmt"
	"os"
	"path/filepath"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

type SQLiteStore struct {
	DB *sql.DB
}

func NewSQLiteStore(path string) (*SQLiteStore, error) {
	if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
		return nil, fmt.Errorf("mkdir sqlite dir: %w", err)
	}

	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}

	s := &SQLiteStore{DB: db}
	if err := s.migrate(); err != nil {
		return nil, err
	}
	return s, nil
}

func (s *SQLiteStore) Close() error { return s.DB.Close() }

func (s *SQLiteStore) migrate() error {
	queries := []string{
		`CREATE TABLE IF NOT EXISTS sessions (
			token TEXT PRIMARY KEY,
			username TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			expires_at INTEGER NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS reset_tokens (
			token TEXT PRIMARY KEY,
			username TEXT NOT NULL,
			expires_at INTEGER NOT NULL,
			used INTEGER NOT NULL DEFAULT 0
		);`,
		`CREATE TABLE IF NOT EXISTS pending_signups (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL,
			email TEXT NOT NULL,
			password_hash TEXT NOT NULL,
			created_at INTEGER NOT NULL,
			approved INTEGER NOT NULL DEFAULT 0
		);`,
		`CREATE TABLE IF NOT EXISTS user_phones (
			username TEXT PRIMARY KEY,
			phone TEXT NOT NULL
		);`,
		`CREATE TABLE IF NOT EXISTS sms_reset_codes (
			id TEXT PRIMARY KEY,
			username TEXT NOT NULL,
			code TEXT NOT NULL,
			expires_at INTEGER NOT NULL,
			used INTEGER NOT NULL DEFAULT 0
		);`,
	}
	for _, q := range queries {
		if _, err := s.DB.Exec(q); err != nil {
			return err
		}
	}
	_, _ = s.DB.Exec(`DELETE FROM sessions WHERE expires_at < ?`, time.Now().Unix())
	_, _ = s.DB.Exec(`DELETE FROM reset_tokens WHERE expires_at < ? OR used = 1`, time.Now().Unix())
	_, _ = s.DB.Exec(`DELETE FROM sms_reset_codes WHERE expires_at < ? OR used = 1`, time.Now().Unix())
	return nil
}

// SetPhone sets the phone number for a user.
func (s *SQLiteStore) SetPhone(username, phone string) error {
	_, err := s.DB.Exec(
		`INSERT INTO user_phones(username, phone) VALUES(?, ?) ON CONFLICT(username) DO UPDATE SET phone = ?`,
		username, phone, phone,
	)
	return err
}

// GetPhone retrieves the phone number for a user.
func (s *SQLiteStore) GetPhone(username string) (string, error) {
	var phone string
	err := s.DB.QueryRow(`SELECT phone FROM user_phones WHERE username = ?`, username).Scan(&phone)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return phone, nil
}

// FindUserByPhone returns the username for a given phone number.
func (s *SQLiteStore) FindUserByPhone(phone string) (string, error) {
	var username string
	err := s.DB.QueryRow(`SELECT username FROM user_phones WHERE phone = ?`, phone).Scan(&username)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", nil
		}
		return "", err
	}
	return username, nil
}

// StoreSMSResetCode stores a reset code for SMS-based password reset.
func (s *SQLiteStore) StoreSMSResetCode(id, username, code string, expiresAt int64) error {
	_, err := s.DB.Exec(
		`INSERT INTO sms_reset_codes(id, username, code, expires_at, used) VALUES(?, ?, ?, ?, 0)`,
		id, username, code, expiresAt,
	)
	return err
}

// VerifySMSResetCode checks if a code is valid for the given phone's user.
func (s *SQLiteStore) VerifySMSResetCode(phone, code string) (string, error) {
	username, err := s.FindUserByPhone(phone)
	if err != nil {
		return "", err
	}
	if username == "" {
		return "", fmt.Errorf("no user with that phone")
	}

	var id string
	var expires int64
	var used int
	err = s.DB.QueryRow(
		`SELECT id, expires_at, used FROM sms_reset_codes WHERE username = ? AND code = ? ORDER BY expires_at DESC LIMIT 1`,
		username, code,
	).Scan(&id, &expires, &used)
	if err != nil {
		if err == sql.ErrNoRows {
			return "", fmt.Errorf("invalid code")
		}
		return "", err
	}
	if used == 1 {
		return "", fmt.Errorf("code already used")
	}
	if time.Now().Unix() > expires {
		return "", fmt.Errorf("code expired")
	}

	_, _ = s.DB.Exec(`UPDATE sms_reset_codes SET used = 1 WHERE id = ?`, id)
	return username, nil
}
