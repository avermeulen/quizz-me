
import * as mongoose from 'mongoose';
import {IFeedbackSession} from '../models';

export default class FeedbackRoutes{
    private feedbackSession : mongoose.Model<IFeedbackSession>;

    constructor(feedbackSession : mongoose.Model<IFeedbackSession>){
        this.feedbackSession = feedbackSession;
        //lzog(this.feedbackSession);
    }

    async index(req, res, next){
        try{
            let feedbackList = await this.feedbackSession.find({})
            res.render('feedback/index', {feedbackList});
        }
        catch(err){
            next(err);
        }

    }
}
