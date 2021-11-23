const { leerInput,inquirerMenu,pausa, listarLugares} = require('./helpers/inquirer')
const Busquedas = require('./models/busqueda')
// Con este paquete cargamos las configuracion de las variables de entorno
require('dotenv').config()

const main = async() =>{

    const busquedas = new Busquedas();

    do {
        // Imprime el menu
        opt = await inquirerMenu();

        // Creamos la lista de opciones
        switch (opt) {
            case 1:
                const lugar = await leerInput('Ciudad:') 
                const lugares = await busquedas.ciudad(lugar) 
                const id = await listarLugares(lugares)
                if(id === '0') continue
                const seleccionado = lugares.find(l =>l.id === id)
                const { nombre,lng,lat } = seleccionado
                busquedas.agregarHistorial(nombre)
                const clima = await busquedas.climaLugar(lat,lng);
                const { desc,min,max,temp } = clima
                console.clear()
                console.log('\nInformacion de la ciudad\n')
                console.log('Ciudad:', nombre)
                console.log('Lat:',lat)
                console.log('Lng:',lng)
                console.log('Temperatura:',temp)
                console.log('Min:',min)
                console.log('Max:',max)
                console.log('Estado del clima:',desc)
            break;
            case 2:
                busquedas.historialCapitalizado.forEach((lugares,i)=>{
                    console.log(i+1,lugares)
                })
            break;
        };

        await pausa();     

    } while (opt !== 0);
}

main();