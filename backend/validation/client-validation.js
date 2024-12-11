import {check, validationResult} from "express-validator";

export const validationClient = () => {
    return [
        check("Name").notEmpty().withMessage("El Nombre es requerido"),
        check("Name").isLength({max: 45}).withMessage("El Nombre no puede tener más de 45 caracteres"),        
        check("Mobile").notEmpty().withMessage("El Móvil es requerido"),
        check("Mobile").isNumeric().withMessage("El Móvil no tiene el formato correcto"),
        check("Mobile").isLength({max: 9}).withMessage("El Móvil no puede tener más de 9 caracteres"),
        check("Email").notEmpty().withMessage("El Email es requerido"),
        check("Email").isEmail().withMessage("El Email no tiene el formato correcto"),
        check("Email").isLength({max: 45}).withMessage("El Email no puede tener más de 45 caracteres"),
        check("Address").isLength({max: 45}).withMessage("La Dirección no puede tener más de 45 caracteres"),
        check("Country").isLength({max: 45}).withMessage("El País no puede tener más de 45 caracteres"), 
        check("Province").isLength({max: 45}).withMessage("La Provincia no puede tener más de 45 caracteres"),
        check("Locality").isLength({max: 45}).withMessage("La Localidad no puede tener más de 45 caracteres"),
        check("Observations").isLength({max: 2000}).withMessage("Las Observaciones no puede tener más de 2000 caracteres"),      
        
        (req, res, next) => {
            const errors = validationResult(req);
            if(!errors.isEmpty())
            {
                const errorsMsg = errors.array().map(error => error.msg);
                return res.status(400).json({"errors":errorsMsg});
            }
            next();
        }

    ]
}