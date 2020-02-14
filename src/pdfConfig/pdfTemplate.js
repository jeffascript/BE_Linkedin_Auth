// const imageDataURI = require("image-data-uri")

const pdfTemplate =  (profileToPDF)=>{
    const {imageUrl, firstname, surname, email, bio, title, area, experience} = profileToPDF
    // const img = path.join(__dirname, `../../${imageUrl}`);
    
    var pdfDefinition = {
        textLeft: [`${email} \n\n `, `${bio} \n\n `],
        textRight: [`${firstname} ${surname}\n\n `, `${title} \n\n `, `${area} \n\n `]
    };


    // "imageUrl": "https://via.placeholder.com/150",
    // "_id": "5e26ec763bdafd3fb1e4df05",
    // "firstname": "Diego",
    // "surname": "Banovaz",
    // "email": "diego@strive.school",
    // "bio": "SW ENG",
    // "title": "COO @ Strive School",
    // "area": "Berlin",
    // "username": "admin1",
    // "experience": [],
    // "createdAt": "2020-01-21T17:43:29.460Z",
    // "updatedAt": "2020-01-21T17:43:29.460Z"

//    var im =  await imageDataURI.encodeFromURL('https://m.media-amazon.com/images/M/MV5BMTYwNjAyODIyMF5BMl5BanBnXkFtZTYwNDMwMDk2._V1_SX300.jpg').toString()

//    console.log(im.toString())
//    // RETURNS image data URI :: 'data:image/png;base64,PNGDATAURI/'







        return{

       
        content: [ 
            
            
            //  {
            //      image: ,
            //      width: 150,
            //      alignment: 'center',
            //  },
                  
            
            {
                style: 'section',
                
                table: {
                    widths: [ '30%', '70%'],
                    body: [
                        
                        
                        [ 
                            {
                              
                              fillColor: '#555555',
                               text: pdfDefinition.textLeft,
                              
                          
                            
                            },
                            {
                              text: pdfDefinition.textRight,
                              color: '#555555',
                              fillColor: '#dedede'
                            }
                        ]
                       
                    ]
                },
                layout: 'noBorders'
            }
            
        ],
        styles: {
            section: {
                fontSize: 11,
                color: '#FFFFFF',
                fillColor: '#2361AE',
                margin: [0, 15, 0, 5]
            }
        },
        defaultStyle: {
            alignment: 'left',
            columnGap: 15,
           
        }
    }
    
}

module.exports=pdfTemplate