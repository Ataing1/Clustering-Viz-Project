import {useEffect, useRef, FunctionComponent, useState, FC} from "react";
import {Network} from "vis-network";
import {nanoid} from "nanoid";
import {Button, TextField, ListItem} from '@mui/material';
import {formatRelative} from 'date-fns';
interface ClusterData {
    ClusterID: string,
    NumberOfAsins: number,
    CreationDate: string,
    ConfidenceScore: number,
    Coverage: number,
    Technique: string,
    Status: string,
    Assignment: string | null,
}


interface InfoDisplayProp {
    clusters: ClusterData[],
}

const techniques = ["Technique1", "Technique2", "Technique3"];

const getClusterDataAsString = (cluster: ClusterData) => {
    return `Cluster ID: ${cluster.ClusterID}
    Number Of Asins: ${cluster.NumberOfAsins}
    Creation Date: ${cluster.CreationDate}
    Confidence Score: ${cluster.ConfidenceScore}
    Coverage: ${cluster.Coverage}
    Technique: ${cluster.Technique}
    Status: ${cluster.Status}
    Assignment: ${cluster.Assignment}`
}
const nodeIDs = []
for (let i = 0; i < 20; i++) {
    nodeIDs.push(nanoid(5));
}

const getRandomInRange = (min, max) => {
    return Math.floor(min + Math.random() * (max - min + 1));
}

const getColorFromAccuracy = (accuracy) => {
    let green;
    let red;
    if (accuracy === 50) {
        green = 255;
        red = 255;
    } else if (accuracy < 50) {
        red = 255;
        green = Math.floor((accuracy / 50) * 255);
    } else {
        green = 255;
        red = Math.floor((1 - ((accuracy - 50) / 50)) * 255);
    }

    return `rgb(${red}, ${green}, 0)`;
}

const generateClusterData = () => {
    const map = new Map<string, ClusterData>();
    for (let i = 0; i < 20; i++) {
        const cluster: ClusterData = {
            ClusterID: nodeIDs[i],
            NumberOfAsins: getRandomInRange(0, 1000),
            CreationDate: formatRelative((new Date(), 3), new Date()),
            ConfidenceScore: getRandomInRange(0, 100),
            Coverage: getRandomInRange(0, 100),
            Technique: techniques[getRandomInRange(0, 2)],
            Status: "unknown",
            Assignment: null
        }
        map.set(nodeIDs[i], cluster);
    }
    return map
}

const getCurrentClusterArray = (nodes: any[]) => {
    let result = [];
    for (const nodeId of nodes) {
        result.push(clusterIdMap.get(nodeId))
    }
    return result;
}

const clusterIdMap = generateClusterData();

const InfoDisplay: FC<InfoDisplayProp> = ({clusters}) => {
    const [textBox, setTextBox] = useState("");


    console.log("prop to INFO DISPLAY" + JSON.stringify(clusters))
    let result;
    if (clusters.length === 0) {
        result = <div>click a node to view</div>;
    } else if (clusters.length === 1) {
        const cluster = clusters[0];
        result = <div id="side-bar-info">
            <TextField
                id="outlined-basic"
                label="Assign"
                value={textBox}
                onChange={e => setTextBox(e.target.value)}
                margin="normal"
            />
            <Button onClick={e => {
                e.preventDefault();
                alert("calling api to assign " + textBox + " to this node");
                let alter = clusterIdMap.get(cluster.ClusterID);
                alter.Assignment = textBox;
                clusterIdMap.set(cluster.ClusterID, alter);
            }}>Assign</Button>
            <p>Cluster ID: {cluster.ClusterID}</p>
            <p>Number of ASINs: {cluster.NumberOfAsins}</p>
            <p>Creation date: {cluster.CreationDate}</p>
            <p>Confidence score: {cluster.ConfidenceScore}</p>
            <p>Coverage: {cluster.Coverage}</p>
            <p>Technique: {cluster.Technique}</p>
            <p>Status: {cluster.Status}</p>
            <p>Assignment: {cluster.Assignment !== null ? cluster.Assignment : ""}</p>

        </div>
    } else {

        result = <div>
            <TextField
                id="outlined-basic"
                label="Assign"
                value={textBox}
                onChange={e => setTextBox(e.target.value)}
                margin="normal"
            />
            <Button onClick={e => {
                e.preventDefault();
                alert("calling api to assign " + textBox + " to these nodes");
                for(let i = 0;i<clusters.length;i++){
                    let cluster = clusters[i];
                    let alter = clusterIdMap.get(cluster.ClusterID);
                    alter.Assignment = textBox;
                    clusterIdMap.set(cluster.ClusterID, alter);
                }
            }}>Assign All</Button>
            <p>Currently Selected Nodes:</p>
            <ul>
                {clusters.map((cluster: ClusterData) => <ListItem
                    key={cluster.ClusterID}>{cluster.ClusterID}</ListItem>)}
            </ul>


        </div>
    }

    return result;
}


const VisNetwork: FunctionComponent = () => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    /*const nodes = [
        {id: 1, label: "Node 1", color: "yellow", value: 100},
        {id: 2, label: "Node 2", color: "green", value: 14},
        {id: 3, label: "Node 3", color: "yellow", value: 23},
        {id: 4, label: "Node 4", color: "green", value: 22},
        {id: 5, label: "Node 5", color: "green", value: 25},
    ];*/
    const [currentCluster, setCurrentCluster] = useState<ClusterData[]>([]);
    const {nodes, edges} = getData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    // const edges = [
    //     {from: 1, to: 3},
    //     {from: 1, to: 2},
    //     {from: 2, to: 4},
    //     {from: 2, to: 5},
    //     {from: 3, to: 3},
    // ];

    const options = {
        autoResize: true,
        height: '100%',
        width: '100%',
        clickToUse: false,

        nodes: {
            fixed: false, //wiggly or not
            shape: "circle",
            scaling: {
                min: 10,
                max: 100,
                label: {
                    enabled: true,
                    min: 10,
                    max: 30,
                    maxVisible: 30,
                    drawThreshold: 5
                },
            },
        },
        edges: {
            color: "black",
            smooth: true,
        },
        interaction: {
            hover: true,
            hoverConnectedEdges: true,
            dragNodes: false,
            multiselect: true,

        },
        physics: {
            barnesHut: {
                springConstant: 0,
                avoidOverlap: .1
            }
        }
    }

    const visJsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const network = new Network(visJsRef.current, {nodes, edges}, options);
        network.on('hoverNode', (e) => {
            console.log("THis node was hovered on:  " + e.node + " " + JSON.stringify(e));
        });
        network.on('doubleClick', (e) => {
            console.log("node " + JSON.stringify(e) + " was double clicked");
            alert("this would take you to the ")
        })
        network.on('click', (e) => {
            console.log("node " + JSON.stringify(e.nodes) + " was clicked");
            setCurrentCluster(getCurrentClusterArray(e.nodes));

        })
        network.on('deselectNode', (e) => {
            console.log("nodes were removed. here is what remains " + JSON.stringify(e.nodes));
            setCurrentCluster(getCurrentClusterArray(e.nodes));
        })
        network.on('showPopup', (e) => {
            console.log("popup event called");
        })
        return () => {
        }
    }, []); //no dependencies, since we don't want to rerender the cluster. change it to nodes and edges when we want to rerender based on new queried info.


    return <>
        <div id="cluster-sidebar-wrapper">
            {/*make it the node cluster and a side bar using column or smth*/}
            <div ref={visJsRef}
                 id="cluster-style"
                 style={{
                     // margin: 'auto',

                 }}
            >
            </div>
            <div className="sidebar">
                <div>
                    <InfoDisplay clusters={currentCluster}></InfoDisplay>
                </div>
            </div>
        </div>
    </>
};


const getData = () => {
    let node = []
    let edge = []
    for (let i = 0; i < 20; i++) {
        const cluster = clusterIdMap.get(nodeIDs[i])
        node.push({
            id: cluster.ClusterID,
            label: cluster.ClusterID,
            color: getColorFromAccuracy(cluster.ConfidenceScore),
            // color: `rgb(${getRandomInRange(0, 255)},255, 0)`,
            // color: `rgb(${getRandomInRange(0,255)}, ${getRandomInRange(0,255)}, 0)`,
            value: cluster.NumberOfAsins,
            title: getClusterDataAsString(cluster),
        })
        let numEdges = getRandomInRange(-1, 1);
        let used = new Set()
        used.add(i);
        while(numEdges>=0){
            let randomNumber = getRandomInRange(0,19)
            if(used.has(randomNumber)){

            }else{
                edge.push({
                    from: nodeIDs[i],
                    to: nodeIDs[randomNumber]
                })
                numEdges--;
            }
        }

    }
    return {nodes: node, edges: edge};
}


export default VisNetwork;