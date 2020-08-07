import { Request, Response } from "express";
import db from "../database/connection";
import ConvertHourToMinutes from "../utils/convertHourToMinutes";

interface ScheduleItem {
    week_day: number;
    from: string;
    to: string;
}

interface QueryString{
    subject: string;
    week_day: string;
    time: string;
}

export default class ClassesController {
    constructor() {

    }

    async index(req: Request, res: Response) {
        const filters: QueryString = {
            subject: req.query.subject as string,
            week_day: req.query.week_day as string,
            time: req.query.time as string
        }

        if (!filters.week_day || !filters.subject || !filters.time) {
            return res.status(400).json({
                error: 'Missing filters to search classes'
            });
        }

        const timeInMinutes = ConvertHourToMinutes(filters.time);

        const classes = await db('classes')
            .whereExists(function () {
                this.select('class_schedule.*')
                    .from('class_schedule')
                    .whereRaw('`class_schedule`.`class_id` = `classes`.`id`')
                    .whereRaw('`class_schedule`.`week_day` = ??', [Number(filters.week_day)])
                    .whereRaw('`class_schedule`.`from` <= ??', [timeInMinutes])
                    .whereRaw('`class_schedule`.`to` > ??', [timeInMinutes])

            })
            .where('classes.subject', '=', filters.subject)
            .join('users', 'classes.user_id', '=', 'users.id')
            .select(['classes.*', 'users.*']);

        return res.json(classes);

    }

    async create(req: Request, res: Response) {
        const { name, avatar, bio, whatsapp, subject, cost, schedule } = req.body;

        const trx = await db.transaction();

        try {
            const insertedUsersIds = await trx('users').insert({
                name, avatar, whatsapp, bio,
            });

            const user_id = insertedUsersIds[0];

            const insertedClassesIds = await trx('classes').insert({
                subject,
                cost,
                user_id,
            })

            const class_id = insertedClassesIds[0];

            const classSchedule = schedule.map((item: ScheduleItem) => {
                return {
                    class_id,
                    week_day: item.week_day,
                    from: ConvertHourToMinutes(item.from),
                    to: ConvertHourToMinutes(item.to),
                }
            })

            await trx('class_schedule').insert(classSchedule);

            trx.commit();

            return res.status(201).send();

        } catch (error) {
            trx.rollback();
            return res.status(400).json({
                error: 'Unexpected error while creating new class.'
            });
        }

    }
}