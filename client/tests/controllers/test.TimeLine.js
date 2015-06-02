import expect from 'expect';
import TimeLine from '../../js/controllers/TimeLine';
import DataStore from '../../js/libs/DataStore';
import timeLineData from '../data/timeline';

describe('controllers/TimeLine', () => {
    var timeLine;
    var dataStore;

    beforeEach(() => {
        dataStore = global.dataStore = new DataStore();

        timeLine = new TimeLine();

        timeLine.frames.length = 15;
    });

    afterEach(() => {
        timeLine.stopListening();
    });

    describe('buildFrames', () => {
        it('should build a complex structure', () => {
            dataStore.set('0000', {
                id: '0000',
                timeLine: [
                    {
                        frame: 0,
                        nodes: [
                            '2345'
                        ]
                    },
                    {
                        frame: 5,
                        nodes: [
                            '2345',
                            '4567'
                        ]
                    },
                    {
                        frame: 10,
                        nodes: [
                            '4567'
                        ]
                    }
                ]
            });

            dataStore.set('2345', {
                id: '2345',
                timeLine: [
                    {
                        frame: 0,
                        transform: 'scale(2) translate(23,0)',
                        nodes: [
                            {type: 'Rectangle', x: 56, y: 4},
                            {type: 'Ellipse', cy: 879, cx: 41},
                            '1234'
                        ]
                    },
                    {
                        frame: 3,
                        transform: 'scale(4) translate(34,56)'
                    }
                ]
            });

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
                    }
                ]
            });

            dataStore.set('4567', {
                id: '4567',
                type: 'Rectangle',
                x: '1024',
                y: '265',
                timeLine: [
                    {frame: 0}
                ]
            });

            timeLine.buildFrames();

            expect(timeLine.frames).toEqual(timeLineData);
        });

    });
});
