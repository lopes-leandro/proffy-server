import { Request, Response } from "express";
import db from "../database/connection";
import ConvertHourToMinutes from "../utils/convertHourToMinutes";


export default class ConnectionsController {
    constructor() {
        
    }

    async index(req: Request, res: Response) {
        const totalConnections = await db('connections').count('* as total');

        const {total} = totalConnections[0];

        return res.json({total});
    }

    async create(req: Request, res: Response) {
        const {user_id} = req.body;

        await db('connections').insert({user_id,});

        res.status(201).send();
    }
}