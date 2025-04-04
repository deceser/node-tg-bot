import { ProfileDisplay } from "./settings/profileDisplay.js";
import { ProfileEditor } from "./settings/profileEditor.js";
import { EditStarter } from "./settings/editStarter.js";
import { SectionHandler } from "./settings/sectionHandler.js";

export class SettingsService {
  // Методы отображения профиля и настроек
  static handleSettingsCommand = ProfileDisplay.handleSettingsCommand;
  static showProfileSettings = ProfileDisplay.showProfileSettings;

  // Методы для редактирования профиля
  static handleProfileEdit = ProfileEditor.handleProfileEdit;

  // Методы для начала процесса редактирования
  static startEditName = EditStarter.startEditName;
  static startEditBirthdate = EditStarter.startEditBirthdate;
  static startEditBirthtime = EditStarter.startEditBirthtime;

  // Методы для обработки разделов настроек
  static handleSettingsSection = SectionHandler.handleSettingsSection;
}
