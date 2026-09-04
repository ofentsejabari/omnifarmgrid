/** Raw document as returned by Appwrite TablesDB. */
export interface AppwriteRowRecord {
  $id: string;
  $createdAt?: string;
  $updatedAt?: string;
  $permissions?: string[];
  $databaseId?: string;
  $tableId?: string;
  $collectionId?: string;
  [key: string]: unknown;
}
