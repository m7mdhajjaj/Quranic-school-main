import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Storage Helper for React Native
 * استخدام AsyncStorage بدلاً من localStorage
 */

export class StorageHelper {
  /**
   * حفظ بيانات في AsyncStorage
   */
  static async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key} to AsyncStorage:`, error);
      throw error;
    }
  }

  /**
   * حفظ object كـ JSON
   */
  static async setObject(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error(`Error saving object ${key} to AsyncStorage:`, error);
      throw error;
    }
  }

  /**
   * قراءة بيانات من AsyncStorage
   */
  static async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error reading ${key} from AsyncStorage:`, error);
      return null;
    }
  }

  /**
   * قراءة object من JSON
   */
  static async getObject<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error(`Error reading object ${key} from AsyncStorage:`, error);
      return null;
    }
  }

  /**
   * حذف عنصر
   */
  static async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from AsyncStorage:`, error);
      throw error;
    }
  }

  /**
   * حذف عدة عناصر
   */
  static async removeMultiple(keys: string[]): Promise<void> {
    try {
      await AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error("Error removing multiple keys from AsyncStorage:", error);
      throw error;
    }
  }

  /**
   * مسح كل البيانات
   */
  static async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error("Error clearing AsyncStorage:", error);
      throw error;
    }
  }

  /**
   * الحصول على جميع المفاتيح
   */
  static async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return Array.from(keys);
    } catch (error) {
      console.error("Error getting all keys from AsyncStorage:", error);
      return [];
    }
  }
}

// Auth specific helpers
export const AuthStorage = {
  async saveToken(token: string): Promise<void> {
    await StorageHelper.setItem("token", token);
  },

  async getToken(): Promise<string | null> {
    return await StorageHelper.getItem("token");
  },

  async removeToken(): Promise<void> {
    await StorageHelper.removeItem("token");
  },

  async saveUser(user: any): Promise<void> {
    await StorageHelper.setObject("user", user);
  },

  async getUser<T>(): Promise<T | null> {
    return await StorageHelper.getObject<T>("user");
  },

  async removeUser(): Promise<void> {
    await StorageHelper.removeItem("user");
  },

  async logout(): Promise<void> {
    await StorageHelper.removeMultiple(["token", "user", "userId"]);
  },

  async clearAuth(): Promise<void> {
    await StorageHelper.removeMultiple(["token", "user", "userId"]);
  },
};

export default StorageHelper;
