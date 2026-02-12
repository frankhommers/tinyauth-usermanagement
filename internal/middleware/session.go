package middleware

import (
	"net/http"
	"time"

	"tinyauth-usermanagement/internal/config"
	"tinyauth-usermanagement/internal/store"

	"github.com/gin-gonic/gin"
)

func SessionMiddleware(cfg config.Config, st *store.Store) gin.HandlerFunc {
	return func(c *gin.Context) {
		token, err := c.Cookie(cfg.SessionCookieName)
		if err != nil || token == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		username, expiresAt, err := st.GetSession(token)
		if err != nil || username == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		if time.Now().Unix() > expiresAt {
			_ = st.DeleteSession(token)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		c.Set("username", username)
		c.Next()
	}
}
