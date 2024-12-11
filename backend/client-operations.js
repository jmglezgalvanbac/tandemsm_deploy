import mysql from 'mysql';

export function addClient(connection, data, callback) 
{
    let insertQuery = "INSERT INTO Clients (Name, Mobile, Email, Address, Country, Province, Locality, Observations) VALUES (?,?,?,?,?,?,?,?)";
    let query = mysql.format(insertQuery, [data.Name, data.Mobile, data.Email, data.Address, data.Country, data.Province, data.Locality, data.Observations]);
    connection.query(query, function(err, result){
        if(err) throw err;
        data.ClientId = result.insertId;
        callback(data);
    });
}

export function getClients(connection, callback) 
{
    connection.query("SELECT * FROM Clients", function(err, result){
        if(err) throw err;
        callback(result);
    });
}

