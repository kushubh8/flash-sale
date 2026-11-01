import {
    Column,
    DataSource,
    Entity,
    PrimaryColumn,
} from 'typeorm'



abstract class DBConnection  {
    static appDataSource:any
    async initConnection() {
        let connection = new DataSource({
            type: "postgres",
            host: "localhost",
            port: 55000,
            username: "postgres",
            password: "sunil123",
            database: "allen",
            synchronize: true,
            logging: false,
            entities: [],
            subscribers: [],
            migrations: [],
        })
        if (!DBConnection.appDataSource) {
            DBConnection.appDataSource = await connection.initialize()
        }
    }
   
}

export {DBConnection}









