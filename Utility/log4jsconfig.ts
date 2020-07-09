// "use strict";
// Object.defineProperty(exports, "__esModule", {
//     value: true
// });
let log4js = require('log4js');
export class log4jsconfig {
    async Log() {
        
        log4js.configure({
            "appenders": {
                // "console": {
                //     "type": "console",
                //     "category": "console"
                // },

                "file": {
                    "category": "test-file-appender",
                    "type": "datefile",
                    "filename": "log/all-the-logs.log",
                    "maxlogsize": 10240,
                    "backups": 3,
                    "pattern": "%d{dd/MM  hh:mm} %-5p %m"
                }
            },
            "categories": {
                "default": {
                    "appenders": ["file",],
                    "level": "INFO"
                },
                "file": {
                    "appenders": ["file",],
                    "level": "Error"
                }
            }
        });
        let log = log4js.getLogger("default");
        return log;
    }
}
// exports.log4jsconfig = log4jsconfig;