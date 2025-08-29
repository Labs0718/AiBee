"""
Groupware authentication service for storing encrypted passwords
"""

from services.supabase import DBConnection
from utils.logger import structlog
from cryptography.fernet import Fernet
import os
import base64

class GroupwareAuthService:
    def __init__(self):
        # Get encryption key from environment or generate one
        encryption_key = os.getenv('GROUPWARE_ENCRYPTION_KEY')
        if not encryption_key:
            # Generate a new key if not set (for development)
            encryption_key = Fernet.generate_key().decode()
            print(f"Generated new encryption key: {encryption_key}")
            print("Please set GROUPWARE_ENCRYPTION_KEY environment variable to this value")
        
        if isinstance(encryption_key, str):
            encryption_key = encryption_key.encode()
            
        self.cipher = Fernet(encryption_key)

    async def store_groupware_password(self, user_id: str, password: str) -> bool:
        """
        Store encrypted groupware password for a user
        
        Args:
            user_id: The user ID
            password: Plain text password to encrypt and store
            
        Returns:
            bool: True if successful, False otherwise
        """
        try:
            db = DBConnection()
            await db.initialize()
            client = await db.client
            
            # Encrypt the password
            encrypted_password = self.cipher.encrypt(password.encode()).decode()
            
            # Store in database (upsert to handle updates)
            result = await client.table('groupware_passwords').upsert({
                'user_id': user_id,
                'encrypted_password': encrypted_password
            }).execute()
            
            if result.data:
                structlog.get_logger().info(f"Successfully stored groupware password for user {user_id}")
                return True
            else:
                structlog.get_logger().error(f"Failed to store groupware password for user {user_id}")
                return False
                
        except Exception as e:
            structlog.get_logger().error(f"Error storing groupware password for user {user_id}: {str(e)}")
            return False

    async def get_groupware_password(self, user_id: str) -> str | None:
        """
        Retrieve and decrypt groupware password for a user
        
        Args:
            user_id: The user ID
            
        Returns:
            str | None: Decrypted password if found, None otherwise
        """
        try:
            db = DBConnection()
            await db.initialize()
            client = await db.client
            
            # Get encrypted password from database
            result = await client.table('groupware_passwords').select('encrypted_password').eq('user_id', user_id).single().execute()
            
            if result.data and result.data.get('encrypted_password'):
                encrypted_password = result.data['encrypted_password']
                # Decrypt the password
                decrypted_password = self.cipher.decrypt(encrypted_password.encode()).decode()
                return decrypted_password
            else:
                structlog.get_logger().warning(f"No groupware password found for user {user_id}")
                return None
                
        except Exception as e:
            structlog.get_logger().error(f"Error retrieving groupware password for user {user_id}: {str(e)}")
            return None