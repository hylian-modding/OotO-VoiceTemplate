import { IPlugin, IModLoaderAPI } from 'modloader64_api/IModLoaderAPI';
import { IOOTCore } from 'modloader64_api/OOT/OOTAPI';
import { InjectCore } from 'modloader64_api/CoreInjection';
import { ModLoaderErrorCodes } from 'modloader64_api/ModLoaderErrorCodes';
import path from 'path';
import fs from 'fs-extra';
import { bus } from 'modloader64_api/EventHandler';
import { OotOnlineEvents } from './OotoAPI/OotoAPI';
import zlib from 'zlib';
import * as sf from 'modloader64_api/Sound/sfml_audio';

class OotO_SoundTemplate implements IPlugin {

    ModLoader!: IModLoaderAPI;
    @InjectCore()
    core!: IOOTCore;
    sounds: Map<number, Array<sf.Sound>> = new Map<number, Array<sf.Sound>>();
    rawSounds: any = {};
    /*
    LUI A0, 0x8060
    SH A1, 0x0088(A0)
    */
    nop: Buffer = Buffer.from('3C048060A4850088', 'hex');
    
    getRandomInt(min: number, max: number) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    preinit(): void {
        let sound_folder: string = path.resolve(__dirname, "sounds");
        fs.readdirSync(sound_folder).forEach((file: string) => {
            let f: string = path.resolve(sound_folder, file);
            let id: number = parseInt(path.parse(file).name.split("-")[0].trim(), 16);
            if (fs.lstatSync(f).isDirectory()) {
                this.sounds.set(id, []);
                this.rawSounds[id] = [];
                fs.readdirSync(f).forEach((sound: string) => {
                    let s: string = path.resolve(f, sound);
                    this.ModLoader.logger.info("Loading " + path.parse(s).base + ".");
                    let snd = this.ModLoader.sound.loadSound(s);
                    this.sounds.get(id)!.push(snd);
                    this.rawSounds[id].push(zlib.deflateSync(fs.readFileSync(s)));
                });
            }
        });
    }

    init(): void {
    }

    postinit(): void {
        bus.emit(OotOnlineEvents.ON_LOAD_SOUND_PACK, this.rawSounds);
    }

    onTick(frame?: number | undefined): void {
        let dir = this.core.global.viewStruct.position.minus(this.core.global.viewStruct.focus).normalized();
        
        this.ModLoader.sound.listener.position = this.core.global.viewStruct.position;
        this.ModLoader.sound.listener.direction = dir;
        this.ModLoader.sound.listener.upVector = this.core.global.viewStruct.axis;

        if (!this.core.helper.isPaused()) {
            this.ModLoader.emulator.rdramWriteBuffer(0x80389048, this.nop);
        }

        if (this.core.link.current_sound_id > 0) {
            if (this.sounds.has(this.core.link.current_sound_id)) {
                let random = this.getRandomInt(0, this.sounds.get(this.core.link.current_sound_id)!.length - 1);
                let sound: sf.Sound = this.sounds.get(this.core.link.current_sound_id)![random];
                sound.position = this.core.link.position;
                sound.minDistance = 250.0
                sound.play();
            } else {
                this.ModLoader.logger.error("Missing sound id " + this.core.link.current_sound_id.toString(16));
            }
        }

        this.sounds.forEach((sound: sf.Sound[], key: number)=>{
            for (let i = 0; i < sound.length; i++){
                sound[i].position = this.core.link.position;
            }
        });
    }

}

module.exports = OotO_SoundTemplate;