

export class qaSQLreader {

    async connectdb(query: string) {
        let sql = require("mssql");

        // var dbConfig = {
        //     server: "eQAV3SQL",
        //     database: "GCMaster",
        //     user: "GlobalCentaraV2",
        //     password: "xine0hp_2V!",
        //    // port: 1433
        // };
        let dbConfig = {
            server: "eStgV3SQL",
            database: "GCMaster",
            user: "GlobalCentaraV2",
            password: "99HhZd30!",
            // port: 1433
        };
        const conn = new sql.ConnectionPool(dbConfig);


        await conn.connect();
        let req = await new sql.Request(conn);

        let resolve = await req.query(query);
 
        await conn.close();
        return await resolve;

    }

    async connectdbUpdate(UserName: string) {
        console.log("Inside Connect Method",UserName);
        var sql = require("mssql");
        var dbConfig = {
            server: "eStgV3SQL",
            database: "GCMaster",
            user: "GlobalCentaraV2",
            password: "99HhZd30!",
        };
        const conn = new sql.ConnectionPool(dbConfig);
        await conn.connect();
        var req = new sql.Request(conn);
        let my_query1 = "update SecurityUsersOrganizations set IsDeleted=1 WHERE SecurityUserId in (Select SecurityUserId from SecurityUsers WHERE UserName='10ashish_testtwo@nitor.com')";
        let resolve1=await req.query(my_query1);
        console.log("RESOLVED1",resolve1);
        
        await conn.close();
    }
}


