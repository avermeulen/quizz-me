import * as mongoose from 'mongoose';
import {Schema} from 'mongoose';
import * as schemas  from './schemas';

import {feedbackSessionSchema, coderFeedbackSchema}
    from './schemas';

interface IFeedbackSession extends mongoose.Document {
    description: String,
    status : String,
    createdAt : Date,
    completedAt : Date,
    _reviewGroup : Schema.Types.ObjectId,
    _coderGroup : Schema.Types.ObjectId
};

interface ICoderFeedback extends mongoose.Document {
    _feedbackSession : Schema.Types.ObjectId,
    type: Schema.Types.ObjectId,
    _coder : Schema.Types.ObjectId,
    feedback : [
        {
            _reviewer : Schema.Types.ObjectId,
            feedback : String,
            reviewedAt : Date
        }
    ]
};

(<any>mongoose).Promise = Promise;

let FeedbackSession : mongoose.Model<IFeedbackSession> =
    mongoose.model<IFeedbackSession>("FeedbackSession", feedbackSessionSchema);

let CoderFeedback: mongoose.Model<ICoderFeedback> =
    mongoose.model<ICoderFeedback>("CoderFeedback", coderFeedbackSchema);

let Course = mongoose.model('Course', schemas.courseSchema);
let User = mongoose.model('User', schemas.userSchema);
let Questionairre = mongoose.model('Questionairre', schemas.quizSchema);
let UserGroup = mongoose.model('UserGroups', schemas.userGroupSchema);
let Email = mongoose.model('Email', schemas.emailSchema);

export {
    IFeedbackSession,
    ICoderFeedback,
    Course,
    Email,
    User,
    Questionairre,
    UserGroup,
    FeedbackSession,
    CoderFeedback
};
