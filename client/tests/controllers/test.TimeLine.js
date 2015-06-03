import expect from 'expect';
import TimeLine from '../../js/controllers/TimeLine';
import DataStore from '../../js/libs/DataStore';
import dataStoreData from '../data/datastore';
import timeLineData from '../data/timeline';

describe('controllers/TimeLine', () => {
    var timeLine;
    var dataStore;

    beforeEach(() => {
        dataStore = new DataStore();

        timeLine = new TimeLine({itemStore: dataStore, rootID: '0000'});

        timeLine.frames.length = 15;
    });

    afterEach(() => {
        timeLine.stopListening();
    });

    describe('buildFrames', () => {
        it('should build a complex structure', () => {
            dataStore.batchSet(dataStoreData);

            timeLine.buildFrames();

            expect(timeLine.frames).toEqual(timeLineData);
        });
    });

    describe('buildNode', () => {
        it('should rebuild a node from an existing frame array', () => {
            dataStore.batchSet(dataStoreData);

            timeLine.buildFrames();

            dataStore.set('1234', {
                id: '1234',
                timeLine: [
                    {
                        frame: 0,
                        nodes: [
                            {type: 'Rectangle', x: 123, y: 21},
                            {type: 'Ellipse', cy: 234, cx: 12}
                        ]
                    },
                    {
                        frame: 2,
                        nodes: [
                            {type: 'Ellipse', cy: 432, cx: 21},
                            {type: 'Rectangle', x: 321, y: 12}
                        ]
                    },
                    {
                        frame: 4,
                        nodes: [
                            {type: 'Ellipse', cy: 2, cx: 1},
                            {type: 'Rectangle', x: 3, y: 4}
                        ]
                    }
                ]
            });

            var node = dataStore.get('1234');

            timeLine.buildNode(node, 4);

            expect(timeLine.frames[4]['1234']).toEqual({
                id: '1234',
                frame: 4,
                nodes: [
                    {type: 'Ellipse', cy: 2, cx: 1},
                    {type: 'Rectangle', x: 3, y: 4}
                ]
            });

            expect(timeLine.frames[3]['1234'].frame).toBe(2);
            expect(timeLine.frames[5]['1234'].frame).toBe(4);
        });
    });
});
