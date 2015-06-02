
By ID structure
```json
{
    "0000": {
        "id": "0000",
        "nodes": [
            "2345"
        ]
    },
    "1234": {
        "id": "1234",
        "nodes": [
            {"type": "Rectangle", "x": 123, "y": 21},
            {"type": "Ellipse", "cy": 234, "cx": 12}
        ]
    },
    "2345": {
        "id": "2345",
        "transform": "scale(2) translate(23,0)",
        "nodes": [
            {"type": "Rectangle", "x": 56, "y": 4},
            {"type": "Ellipse", "cy": 879, "cx": 41},
            "1234"
        ]
    }
}
```

Node tree structure
```json
[
    {
        "id": "0000",
        "nodes": [
            {
                "id": "2345",
                "transform": "scale(2) translate(23,0)",
                "nodes": [
                    {"type": "Rectangle", "x": 56, "y": 4},
                    {"type": "Ellipse", "cy": 879, "cx": 41},
                    {
                        "id": "1234",
                        "nodes": [
                            {"type": "Rectangle", "x": 123, "y": 21},
                            {"type": "Ellipse", "cy": 234, "cx": 12}
                        ]
                    }
                ]
            }
        ]
    }
]
```

TimeLine By ID structure
```json
{
    "0000": {
        "id": "0000",
        "timeLine": [
            {
                "frame": 0,
                "nodes": [
                    "2345"
                ]
            },
            {
                "frame": 5,
                "nodes": [
                    "2345",
                    "4567"
                ]
            },
            {
                "frame": 10,
                "nodes": [
                    "4567"
                ]
            }
        ]
    },
    "2345": {
        "id": "2345",
        "timeLine": [
            {
                "frame": 0,
                "transform": "scale(2) translate(23,0)",
                "nodes": [
                    {"type": "Rectangle", "x": 56, "y": 4},
                    {"type": "Ellipse", "cy": 879, "cx": 41},
                    "1234"
                ]
            },
            {
                "frame": 3,
                "transform": "scale(4) translate(34,56)"
            }
        ]
    },
    "1234": {
        "id": "1234",
        "timeLine": [
            {
                "frame": 0,
                "nodes": [
                    {"type": "Rectangle", "x": 123, "y": 21},
                    {"type": "Ellipse", "cy": 234, "cx": 12}
                ]
            },
            {
                "frame": 2,
                "nodes": [
                    {"type": "Ellipse", "cy": 432, "cx": 21},
                    {"type": "Rectangle", "x": 321, "y": 12}
                ]
            }
        ]
    },
    "4567": {
        "id": "4567",
        "type": "Rectangle",
        "x": "1024",
        "y": "265"
    }

}
```

timeLine expanded
```javascript
[
    {
        "frame": 0,
        "nodes": [
            {
                "id": "2345",
                "transform": "scale(2) translate(23,0)",
                "nodes": [
                    {"type": "Rectangle", "x": 56, "y": 4},
                    {"type": "Ellipse", "cy": 879, "cx": 41},
                    {
                        "id": "1234",
                        "nodes": [
                            {"type": "Rectangle", "x": 123, "y": 21},
                            {"type": "Ellipse", "cy": 234, "cx": 12}
                        ]
                    }
                ]
            }
        ]
    },
    { /* frame 0 */ },
    {
        "frame": 2,
        "nodes": [
            {
                "id": "2345",
                "transform": "scale(2) translate(23,0)",
                "nodes": [
                    { /* from frame 0 */ },
                    { /* from frame 0 */ },
                    {
                        "id": "1234",
                        "nodes": [
                            {"type": "Ellipse", "cy": 432, "cx": 21},
                            {"type": "Rectangle", "x": 321, "y": 12}
                        ]
                    }
                ]
            }
        ]
    },
    {
        "frame": 3,
        "nodes": [
            {
                "id": "2345",
                "transform": "scale(4) translate(34,56)",
                "nodes": [ /* from frame 0 */ ]
            }
        ]
    },
    { /* frame 3 */ },
    {
        "frame": 5,
        "nodes": [
            { /* id 2345 from frame 3 */ },
            {
                "id": "4567",
                "type": "Rectangle",
                "x": "1024",
                "y": "265"
            }
        ]
    },
    { /* frame 5 */ },
    { /* frame 5 */ },
    { /* frame 5 */ },
    { /* frame 5 */ },
    {
        "frame": 10,
        "nodes": [
            { /* id 4567 from frame 5 */ }
        ]
    }
]
```
