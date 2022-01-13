import { INetworkPlayer } from 'modloader64_api/NetworkHandler';
import { bus } from 'modloader64_api/EventHandler';
import { ExternalAPIProvider } from 'modloader64_api/ExternalAPIProvider';
import path from 'path';
import { AgeOrForm } from 'Z64Lib/API/Common/Z64API';
import { Z64LibSupportedGames } from 'Z64Lib/API/Utilities/Z64LibSupportedGames';
import { Z64_GAME } from 'Z64Lib/src/Common/types/GameAliases';

@ExternalAPIProvider("Z64API", "3.1.0", path.resolve(__dirname))
export class Z64OnlineAPIProvider {
}

export enum Z64OnlineEvents {
  PLAYER_PUPPET_PRESPAWN = 'Z64Online:onPlayerPuppetPreSpawned',
  PLAYER_PUPPET_SPAWNED = 'Z64Online:onPlayerPuppetSpawned',
  PLAYER_PUPPET_DESPAWNED = 'Z64Online:onPlayerPuppetDespawned',
  PLAYER_PUPPET_QUERY = "Z64Online:PlayerPuppetQuery",
  SERVER_PLAYER_CHANGED_SCENES = 'Z64Online:onServerPlayerChangedScenes',
  CLIENT_REMOTE_PLAYER_CHANGED_SCENES = 'Z64Online:onRemotePlayerChangedScenes',
  GHOST_MODE = 'Z64Online:EnableGhostMode',
  GAINED_HEART_CONTAINER = 'Z64Online:GainedHeartContainer',
  GAINED_PIECE_OF_HEART = 'Z64Online:GainedPieceOfHeart',
  MAGIC_METER_INCREASED = 'Z64Online:GainedMagicMeter',
  ON_INVENTORY_UPDATE = 'Z64Online:OnInventoryUpdate',
  ON_EXTERNAL_ACTOR_SYNC_LOAD = 'Z64Online:OnExternalActorSyncLoad',
  ON_REGISTER_EMOTE = 'Z64Online:OnRegisterEmote',
  ON_LOAD_SOUND_PACK = "Z64Online:OnLoadSoundPack",
  POST_LOADED_SOUND_LIST = "Z64Online:PostLoadedSoundList",
  ON_SELECT_SOUND_PACK = "Z64Online:OnSelectSoundPack",
  ON_REMOTE_SOUND_PACK = "Z64Online:OnRemoteSoundPack",
  ON_REMOTE_PLAY_SOUND = "Z64Online:OnRemotePlaySound",
  ALLOCATE_MODEL_BLOCK = "Z64Online:AllocateModelBlock",
  POST_LOADED_MODELS_LIST = "Z64Online:PostLoadedModelsList",
  LOAD_EQUIPMENT_BUFFER = "Z64Online:LoadEquipmentBuffer",
  LOAD_EQUIPMENT_PAK = "Z64Online:LoadEquipmentPak",
  REFRESH_EQUIPMENT = "Z64Online:RefreshEquipment",
  SWORD_NEEDS_UPDATE = "Z64Online:UpdateSwordB",
  CLEAR_EQUIPMENT = "Z64Online:ClearEquipment",
  EQUIPMENT_ZOBJ_LOADED = "Z64Online:EqZobjLoad",
  EQUIPMENT_LOAD_START = "Z64Online:EqZobjLoadStart",
  EQUIPMENT_LOAD_END = "Z64Online:EqZobjLoadEnd",
  DEBUG_DUMP_RAM = "Z64Online:DumpRam",
  PUPPETS_CLEAR = "Z64Online:PuppetsClear",
  ON_MODEL_MANAGER_READY = "Z64Online:ON_MODEL_MANAGER_READY",
  PUPPET_AGE_CHANGED = 'Z64Online:PUPPET_AGE_CHANGED',
  SAVE_DATA_ITEM_SET = 'Z64Online:SAVE_DATA_ITEM_SET',
  LOCAL_MODEL_CHANGE_FINISHED = "Z64Online:LOCAL_MODEL_CHANGE_FINISHED",
  CUSTOM_ANIMATION_BANK_REGISTER = "Z64Online:CUSTOM_ANIMATION_BANK_REGISTER",
  FORCE_CUSTOM_ANIMATION_BANK = "Z64Online:FORCE_CUSTOM_ANIMATION_BANK",
  CUSTOM_ANIMATION_BANK_EQUIPPED = "Z64Online:CUSTOM_ANIMATION_BANK_EQUIPPED",
  OBJECT_SPAWN = "Z64Online:ObjectSpawn",

  CHANGE_CUSTOM_MODEL = "Z64Online:CHANGE_CUSTOM_MODEL",
  REGISTER_CUSTOM_MODEL = "Z64Online:REGISTER_CUSTOM_MODEL"
}

export class Z64Online_LocalModelChangeProcessEvt {
  adult: IModelReference;
  child: IModelReference;

  constructor(adult: IModelReference, child: IModelReference) {
    this.adult = adult;
    this.child = child;
  }
}

export function registerModel(model: Buffer, noautoGC: boolean = false): IModelReference {
  let evt = new Z64Online_ModelAllocation(model, 0x69, Z64_GAME);
  bus.emit(Z64OnlineEvents.ALLOCATE_MODEL_BLOCK, evt);
  evt.ref.isPlayerModel = !noautoGC;
  return evt.ref;
}
export interface IModelScript {
  onModelEquipped(): void;
  onModelRemoved(): void;
  onSceneChange(scene: number, ref: IModelReference): IModelReference;
  onDay(ref: IModelReference): IModelReference;
  onNight(ref: IModelReference): IModelReference;
  //onTunicChanged(ref: IModelReference, tunic: Z64Tunic): IModelReference;
  onHealthChanged(max: number, health: number, ref: IModelReference): IModelReference;
  onTick(): void;
}

export class RemoteSoundPlayRequest {

  player: INetworkPlayer;
  pos: Buffer;
  sound_id: number;
  isCanceled: boolean = false;

  constructor(player: INetworkPlayer, pos: Buffer, sound_id: number) {
    this.player = player;
    this.pos = pos;
    this.sound_id = sound_id;
  }
}

export interface Z64Emote_Emote {
  name: string;
  buf: Buffer;
  sound?: Buffer;
  loops: boolean;
}

export function Z64OnlineAPI_EnableGhostMode() {
  bus.emit(Z64OnlineEvents.GHOST_MODE, {});
}

export interface IModelReference {
  hash: string;
  pointer: number;
  isDead: boolean;
  isPlayerModel: boolean;
  isLoaded: boolean;
  loadModel(): boolean;
  unregister(): boolean;
  script: IModelScript | undefined;
  flags: Buffer;
}

export class Z64Online_ModelAllocation {
  name: string = "";
  model: Buffer;
  age: AgeOrForm;
  ref!: IModelReference;
  script: IModelScript | undefined;
  game: Z64LibSupportedGames;

  constructor(model: Buffer, age: AgeOrForm, game: Z64LibSupportedGames) {
    this.model = model;
    this.age = age;
    this.game = game;
  }
}
export class Z64Online_EquipmentPak {
  name: string;
  data: Buffer;
  remove: boolean = false;

  constructor(name: string, data: Buffer) {
    this.name = name;
    this.data = data;
  }
}

export class Z64_AnimationBank {
  name: string;
  bank: Buffer;

  constructor(name: string, bank: Buffer) {
    this.name = name;
    this.bank = bank;
  }
}