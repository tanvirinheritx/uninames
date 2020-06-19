let nameJson = require('../public/jsonData/names.json')


exports.getUninames = async (req, res, next) => {
    try {

        const conditionArr = [undefined, 'ANY', 'random']
        const genderArr = ['male', 'female', null]

        let reqQuery = req.query
        let ext = (Object.keys(reqQuery)).some(e => e == 'ext')

        const reqRegion = conditionArr.includes(req.query.region) ? null : req.query.region
        const reqLanguage = req.query.language ? req.query.language : null;
        const reqGender = conditionArr.includes(req.query.gender) ? null : (req.query.gender).toLowerCase()
        const reqAmount = req.query.amount ? req.query.amount : 5
        const reqMinlen = req.query.minlen ? req.query.minlen : null
        const reqMaxlen = req.query.maxlen ? req.query.maxlen : null

        if ((reqMaxlen < 3 && reqMaxlen !=null) || reqMinlen > 10) {
            res
                .status(400)
                .send({ "error": "maxlen must be minimum 3 and minlen must be maximum 10" })
        }

        if (!genderArr.includes(reqGender)) {
            res
                .status(400)
                .send({ "error": "Invalid gender" })
        }

        if (reqAmount < 1 || reqAmount > 500) {
            res
                .status(400)
                .send({ "error": "Amount of requested names exceeds maximum allowed" })
        }

        let regionMale, regionFemale, regionSurname, region

        if (reqRegion) {
            
            let newReqRegion = reqRegion.charAt(0).toUpperCase() + reqRegion.slice(1).toLowerCase()
            regionObj = nameJson.filter(e => e.region == newReqRegion)
            if (regionObj.length == 0) {
                res
                    .status(400)
                    .send({ "error": "Region or language not found" })
            }

            region = newReqRegion
            regionMale = regionObj[0].male
            regionFemale = regionObj[0].female
            regionSurname = regionObj[0].surnames

            if (reqMaxlen != null || reqMinlen != null) {
                maxlen = reqMaxlen ? reqMaxlen : 100
                minlen = reqMinlen ? reqMinlen : 1

                regionMale = regionMale.filter(e => e.length >= minlen && e.length <= maxlen)
                regionFemale = regionFemale.filter(e => e.length >= minlen && e.length <= maxlen)

                if(reqGender == null && (regionMale.length == 0 || regionFemale.length == 0) ) {
                    res
                    .status(400)
                    .send({ "error": region + "region in data not available"})
                }
                if(reqGender == "male" && regionMale.length == 0 ) {
                    res
                    .status(400)
                    .send({ "error": region + "region in male data not available"})
                }
                if(reqGender == "female" && regionFemale.length == 0) {
                    res
                    .status(400)
                    .send({ "error": region + "region in female data not available"})
                }
            }
        }

        let dataArr = []

        const start = new Date(2000, 0, 1)
        const end = new Date(1975, 0, 1)

        function _calculateAge(birthday) { // birthday is a date
            var ageDifMs = Date.now() - birthday.getTime();
            var ageDate = new Date(ageDifMs); // miliseconds from epoch
            return Math.abs(ageDate.getUTCFullYear() - 1970);
        }

        for (let i = 1; i <= reqAmount; i++) {

            if (reqRegion == null) {
                regionObj = nameJson[Math.floor(Math.random() * nameJson.length)]

                region = regionObj.region
                regionMale = regionObj.male
                regionFemale = regionObj.female
                regionSurname = regionObj.surnames

                if (reqMaxlen != null || reqMinlen != null) {

                    let randomCountry = await getMinMaxName(reqMaxlen, reqMinlen)

                    region = randomCountry.region,
                        regionMale = randomCountry.regionMale,
                        regionFemale = randomCountry.regionFemale,
                        regionSurname = randomCountry.regionSurname
                }
            }

            const randomSurnameIndex = Math.floor(Math.random() * regionSurname.length);
            let surname = regionSurname[randomSurnameIndex]

            const gender = reqGender == null ? Math.floor(Math.random() * 2) : (reqGender == 'male' ? 1 : 0)
            const randomMaleIndex = Math.floor(Math.random() * regionMale.length)
            const randomFemaleIndex = Math.floor(Math.random() * regionFemale.length)

            let randonDate = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))

            let month = randonDate.getMonth() + 1
            let day = randonDate.getDate() < 10 ? '0' + randonDate.getDate() : randonDate.getDate()
            month = month < 10 ? '0' + month : month
            let year = randonDate.getFullYear()
            let datestring = Date.parse(randonDate)

            let name = gender == 1 ? regionMale[randomMaleIndex] : regionFemale[randomFemaleIndex]

            const separation = ['.', '_', '-', '']
            let email, obj

            if (name.length + surname.length >= 12) {
                email = name.toLowerCase() + separation[Math.floor(Math.random() * separation.length)] + year + "@example.com"
            } else {
                email = name.toLowerCase() + separation[Math.floor(Math.random() * separation.length)] + surname + "@example.com"
            }


            let signs = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '{', '}', '~', '+', '=', '_', '']
            let password = surname + year + signs[Math.floor(Math.random() * signs.length)] + signs[Math.floor(Math.random() * signs.length)]

            //expirationYear year between 20 to 50 
            let expirationYear = Math.floor(Math.random() * (51 - 20)) + 20

            photo = gender == 1 ? "/photos/male/" + Math.floor(Math.random() * Math.floor(20)) + ".jpg" : "/photos/female/" + Math.floor(Math.random() * Math.floor(26)) + ".jpg"


            if (ext) {
                obj = {
                    "name": name,
                    "surname": surname,
                    "gender": gender == 1 ? "male" : "female",
                    "region": region,
                    "age": _calculateAge(randonDate),
                    "title": gender == 1 ? "mr" : "ms",
                    "phone": "(" + Math.floor(100 + Math.random() * 900) + ") " + Math.floor(100 + Math.random() * 900) + " " + Math.floor(1000 + Math.random() * 9000),
                    "email": email,
                    "birthday": {
                        "dmy": day + "\/" + month + "\/" + year,
                        "mdy": month + "\/" + day + "\/" + year,
                        "raw": datestring
                    },
                    "password": password,
                    "credit_card": {
                        "number": Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000) + "-" + Math.floor(1000 + Math.random() * 9000),
                        "pin": Math.floor(1000 + Math.random() * 9000),
                        "security": Math.floor(100 + Math.random() * 900),
                        "expiration": (Math.floor(Math.random() * (13 - 1)) + 1) + "\/" + expirationYear
                    },
                    "photo": photo
                }

            } else {
                obj = {
                    "name": name,
                    "surname": surname,
                    "gender": gender == 1 ? "male" : "female",
                    "region": region,
                }
            }
            dataArr.push(obj)
        }

        res.send(dataArr)

    } catch (err) {
        throw err
    }
}


getMinMaxName = async (reqMaxlen, reqMinlen) => {
    try {

        let status = true

        while (status) {

            regionObj = nameJson[Math.floor(Math.random() * nameJson.length)]

            region = regionObj.region
            regionMale = regionObj.male
            regionFemale = regionObj.female
            regionSurname = regionObj.surnames


            maxlen = reqMaxlen ? reqMaxlen : 100
            minlen = reqMinlen ? reqMinlen : 1

            regionMale = regionMale.filter(e => e.length >= minlen && e.length <= maxlen)
            regionFemale = regionFemale.filter(e => e.length >= minlen && e.length <= maxlen)

            if (regionMale.length == 0 || regionFemale == 0) {
                status = true
            } else {
                status = false
                return countryObj = {
                    region: region,
                    regionMale: regionMale,
                    regionFemale: regionFemale,
                    regionSurname: regionSurname
                }
            }

        }

    } catch (err) {
        console.log(err)
        throw err
    }
}