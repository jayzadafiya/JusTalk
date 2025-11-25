export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export class FormValidator {
  static validateUsername(username: string): ValidationResult {
    if (!username) {
      return { isValid: false, error: "Username is required" };
    }
    if (username.length < 3) {
      return {
        isValid: false,
        error: "Username must be at least 3 characters",
      };
    }
    if (username.length > 30) {
      return {
        isValid: false,
        error: "Username must be less than 30 characters",
      };
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return {
        isValid: false,
        error: "Username can only contain letters, numbers and underscores",
      };
    }
    return { isValid: true };
  }

  static validatePassword(password: string): ValidationResult {
    if (!password) {
      return { isValid: false, error: "Password is required" };
    }
    if (password.length < 8) {
      return {
        isValid: false,
        error: "Password must be at least 8 characters",
      };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one lowercase letter",
      };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one uppercase letter",
      };
    }
    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        error: "Password must contain at least one number",
      };
    }
    return { isValid: true };
  }

  static validateConfirmPassword(
    password: string,
    confirmPassword: string
  ): ValidationResult {
    if (!confirmPassword) {
      return { isValid: false, error: "Please confirm your password" };
    }
    if (password !== confirmPassword) {
      return { isValid: false, error: "Passwords do not match" };
    }
    return { isValid: true };
  }

  static validateFirstName(firstName: string): ValidationResult {
    if (!firstName) {
      return { isValid: false, error: "First name is required" };
    }
    if (firstName.length < 2) {
      return {
        isValid: false,
        error: "First name must be at least 2 characters",
      };
    }
    if (firstName.length > 50) {
      return {
        isValid: false,
        error: "First name must be less than 50 characters",
      };
    }
    return { isValid: true };
  }

  static validateBirthdate(birthdate: string): ValidationResult {
    if (!birthdate) {
      return { isValid: false, error: "Birthdate is required" };
    }

    const age =
      (new Date().getTime() - new Date(birthdate).getTime()) /
      (1000 * 60 * 60 * 24 * 365);
    if (age < 13) {
      return { isValid: false, error: "You must be at least 13 years old" };
    }
    if (age > 120) {
      return { isValid: false, error: "Please enter a valid birthdate" };
    }
    return { isValid: true };
  }

  static validateEmail(email?: string): ValidationResult {
    if (!email || email.trim() === "") {
      return { isValid: true };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { isValid: false, error: "Please enter a valid email address" };
    }
    return { isValid: true };
  }

  static validatePhone(phone?: string): ValidationResult {
    if (!phone || phone.trim() === "") {
      return { isValid: true };
    }

    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return {
        isValid: false,
        error: "Please enter a valid phone number (e.g., +1234567890)",
      };
    }
    return { isValid: true };
  }

  static getPasswordStrength(password: string): {
    strength: "weak" | "medium" | "strong";
    score: number;
  } {
    let score = 0;

    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    if (score <= 2) return { strength: "weak", score };
    if (score <= 4) return { strength: "medium", score };
    return { strength: "strong", score };
  }

  static calculateAge(birthdate: string): number {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age;
  }

  static getMaxBirthdate(minAge: number): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - minAge);
    return date.toISOString().split("T")[0];
  }
}
