// src/utils/clearTestVideos.ts
import { Directory, Paths } from "expo-file-system";

export function clearTestVideos() {
  const videosDir = new Directory(Paths.document, "videos");

  if (videosDir.exists) {
    videosDir.delete(); // deletes the folder AND everything inside it
    console.log("Deleted videos folder and all its contents.");
  } else {
    console.log("No videos folder to delete.");
  }
}