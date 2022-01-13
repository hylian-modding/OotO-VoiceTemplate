import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import path from 'path';
import fs from 'fs-extra';
import { bus } from 'modloader64_api/EventHandler';
import { Z64OnlineEvents } from './Z64API/Z64API';
import zlib from 'zlib';
import { IZ64Main } from 'Z64Lib/API/Common/IZ64Main'
import { Z64_GAME } from 'Z64Lib/src/Common/types/GameAliases';
import { Z64LibSupportedGames } from 'Z64Lib/API/Utilities/Z64LibSupportedGames';

class Z64O_VoiceTemplate implements IPlugin {

    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: IZ64Main;
    rawSounds: any = {};
    sound_folder!: string;

    preinit(): void {
        if (Z64_GAME === Z64LibSupportedGames.OCARINA_OF_TIME) this.sound_folder = path.resolve(__dirname, "sounds/oot");
        else if (Z64_GAME === Z64LibSupportedGames.MAJORAS_MASK) this.sound_folder = path.resolve(__dirname, "sounds/mm");

        let getAllSubFolders = (parentDir: string, output: Array<string>) => {
            fs.readdirSync(parentDir).forEach((d: string) => {
                let dir = path.resolve(parentDir, d);
                if (fs.lstatSync(dir).isDirectory()) {
                    output.push(dir);
                }
            });
        };

        let directories: string[] = [];
        getAllSubFolders(this.sound_folder, directories);

        Object.keys(directories).forEach((key: string)=> {
            if(fs.lstatSync(directories[key]).isDirectory()) {
                let sound_folder = directories[key];
                fs.readdirSync(sound_folder).forEach((file: string) => {
                    let f: string = path.resolve(sound_folder, file);
                    let id: number = parseInt(path.parse(file).name.split("-")[0].trim(), 16);
                    if (fs.lstatSync(f).isDirectory()) {
                        this.rawSounds[id] = [];
                        fs.readdirSync(f).forEach((sound: string) => {
                            let s: string = path.resolve(f, sound);
                            this.rawSounds[id].push(zlib.deflateSync(fs.readFileSync(s)));
                        });
                    }
                });
            }
        });
        /* fs.readdirSync(this.sound_folder).forEach((file: string) => {
            let f: string = path.resolve(this.sound_folder, file);
            let id: number = parseInt(path.parse(file).name.split("-")[0].trim(), 16);
            if (fs.lstatSync(f).isDirectory()) {
                this.rawSounds[id] = [];
                fs.readdirSync(f).forEach((sound: string) => {
                    let s: string = path.resolve(f, sound);
                    this.rawSounds[id].push(zlib.deflateSync(fs.readFileSync(s)));
                });
            }
        }); */
        bus.emit(Z64OnlineEvents.ON_LOAD_SOUND_PACK, { id: (this as any)['metadata']["name"], data: this.rawSounds });
    }

    init(): void {
    }

    postinit(): void {
    }

    onTick(frame?: number | undefined): void {
    }

}

module.exports = Z64O_VoiceTemplate;