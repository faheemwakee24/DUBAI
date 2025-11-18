import { Images } from "../assets/images";

export const characters_data = {
    alex: {
        id: 1,
        name: 'Alex',
        image: Images.ch1_bg_1,
        body:{
            casual: Images.ch1_ch_1,
            formal: Images.ch1_ch_2,
            semiFormal: Images.ch1_ch_3,
            sporty: Images.ch1_ch_4,
            superHero: Images.ch1_ch_5,
        },
        hair:{
            short: Images.ch1_hair_1,
            long: Images.ch1_hair_2,
            curly: Images.ch1_hair_3,
            spiky: Images.ch1_hair_4,
        },
        accessories:{
            cap: Images.ch1_cap,
            glasses: Images.ch1_glasses,
            ristwatch: Images.ristwatch,
        },
        background:{
            dubai_red: Images.ch1_bg_1,
            gradient_blue: Images.ch1_bg_2,
            gradient_orange: Images.ch1_bg_3,
          //  solid_white: Images.ch1_bg_4,
            pattern: Images.ch1_bg_4,
        }
    },
};