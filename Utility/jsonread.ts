
export class jsonread {
 
    read(filename: string) {
        'use strict';
        const fs = require('fs');
        let rawdata = fs.readFileSync(filename);
        let or = JSON.parse(rawdata);
        return or;

    }

}