using Konscious.Security.Cryptography;
using System;
using System.Security.Cryptography;
using System.Text;

namespace MigdalorServer.BL
{
    public static class PasswordServices
    {
        // Hard-coded parameters for Argon2id
        private const int Iterations = 4;
        private const int MemorySize = 1024;       // in KB
        private const int DegreeOfParallelism = 2;
        private const int SaltSize = 16;           // in bytes
        private const int HashLength = 16;         // in bytes

        /// <summary>
        /// Generates a cryptographically secure random salt.
        /// </summary>
        /// <returns>A byte array containing the salt.</returns>
        public static byte[] GenerateSalt()
        {
            byte[] salt = new byte[SaltSize];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            return salt;
        }

        /// <summary>
        /// Creates a stored password hash string using Argon2id.
        /// The stored format is: "salt:hash" where both components are Base64 encoded.
        /// </summary>
        /// <param name="password">The plain text password.</param>
        /// <returns>A string combining the salt and hash.</returns>
        public static string CreatePasswordHash(string password)
        {
            byte[] salt = GenerateSalt();

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                Iterations = Iterations,
                MemorySize = MemorySize,
                DegreeOfParallelism = DegreeOfParallelism
            };

            byte[] hash = argon2.GetBytes(HashLength);

            // Combine salt and hash into a single string (Base64 encoded), separated by a colon.
            return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
        }

        /// <summary>
        /// Verifies that a given password matches the stored Argon2id hash.
        /// </summary>
        /// <param name="password">The plain text password to verify.</param>
        /// <param name="storedHash">The stored hash string in the format "salt:hash".</param>
        /// <returns>True if the password is correct; otherwise, false.</returns>
        public static bool VerifyPassword(string password, string storedHash)
        {
            // Expected format: salt:hash
            var parts = storedHash.Split(':');
            if (parts.Length != 2) //password has to have length of at least 2
                throw new FormatException("Stored hash is in an invalid format.");

            byte[] salt = Convert.FromBase64String(parts[0]);
            byte[] expectedHash = Convert.FromBase64String(parts[1]);

            var argon2 = new Argon2id(Encoding.UTF8.GetBytes(password))
            {
                Salt = salt,
                Iterations = Iterations,
                MemorySize = MemorySize,
                DegreeOfParallelism = DegreeOfParallelism
            };

            byte[] computedHash = argon2.GetBytes(expectedHash.Length);
            return SlowEquals(computedHash, expectedHash);
        }

        /// <summary>
        /// Compares two byte arrays in a constant-time manner to prevent timing attacks.
        /// </summary>
        private static bool SlowEquals(byte[] a, byte[] b)
        {
            uint diff = (uint)a.Length ^ (uint)b.Length;
            for (int i = 0; i < a.Length && i < b.Length; i++)
            {
                diff |= (uint)(a[i] ^ b[i]);
            }
            return diff == 0;
        }
    }
}
