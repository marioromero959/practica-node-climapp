const fs = require('fs');
const axios = require('axios'); //Paqeute para realizar peticiones http

class Busquedas {
    historial = ['formosa','Corobita']
    dbPath = './db/database.json'

    constructor(){
        // Leer DB si existe
        this.leerDB()
    }

    get paramsClima(){
        return{
            'appid':process.env.OPENWHEADER_KEY,
            'units':'metric',
            'lang':'es',   
        }
    }

    get historialCapitalizado(){
        return this.historial.map((ciudad,i)=>{
            let palabras = ciudad.split(' ')//Corta las palabras 
            palabras = palabras.map(p=>p[0].toUpperCase() + p.substring(1))
            return palabras.join(' ')
        })
    }

    async ciudad ( lugar = '' ){
        try {
            const instancia = axios.create({
                baseURL:`https://api.mapbox.com/geocoding/v5/mapbox.places/${lugar}.json`,
                params: {
                    'language':'es',   
                    'access_token':process.env.MAPBOX_KEY
                }
            })
            // peticion http
            const resp = await instancia.get();
            //Retorna las ciudades que coincidan con la busqueda
            return resp.data.features.map( ciudad =>({
                id:ciudad.id,
                nombre:ciudad.place_name,
                lng:ciudad.center[0],
                lat:ciudad.center[1],
            })) //Al porner los corchetes dentro de los parentesis indicamos que devolvemos un objeto de forma implicita
        } catch (error) {
            return [];
        }
    }

    async climaLugar(lat,lon){
        try {
            const instance = axios.create({
                baseURL:`https://api.openweathermap.org/data/2.5/weather`,
                params: {...this.paramsClima,lat,lon} //Como no tengo la lat y lon, tengo que desestruccturar todo el parametro y mandar lo que me falta
            })
            const resp = await instance.get();
            const {main,weather} = resp.data 
            return{
                desc: weather[0].description,
                min:main.temp_min,
                max:main.temp_max,
                temp:main.temp,
            }
        } catch (error) {
            console.log(error)   
        }
    }

    agregarHistorial(lugar = ''){
        // Prevenir repetidos
        if(this.historial.includes(lugar.toLocaleLowerCase())){
            return
        }else{
            this.historial = this.historial.splice(0,5)
            this.historial.unshift(lugar.toLocaleLowerCase())
            this.guardarDB();
        }
    }
    guardarDB(){
        const payload = {
            historial:this.historial
        }
        fs.writeFileSync(this.dbPath,JSON.stringify(payload))
    }
    leerDB(){
        if(!fs.existsSync(this.dbPath)){
            return;
        }
        const info = fs.readFileSync(this.dbPath, {encoding:'utf-8'})
        const data = JSON.parse(info)
        this.historial = data.historial
    }

}

module.exports = Busquedas;