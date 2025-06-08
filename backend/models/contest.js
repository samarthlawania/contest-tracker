import mongoose from 'mongoose';

const contestSchema = new mongoose.Schema({
    name: String,
    platform: String,
    url: String,
    startTime: Date,
    endTime: Date,
    status: String,
    solutionLink: String,
});

const Contest = mongoose.model('Contest', contestSchema);
export default Contest;
