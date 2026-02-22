import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {Card, CardContent, LinearProgress} from "@mui/material";
import Grid from '@mui/material/Grid';
import { PieChart } from '@mui/x-charts/PieChart';
import Typography from "@mui/material/Typography";
import {BarChart} from "@mui/x-charts";
import {getSVGURI} from "../libs/Utils";
import Box from "@mui/material/Box";


//------------------------------------------------------------------------------
export const LoadingWidget = () => {
    return (
        <Box sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center', 
            alignItems: 'center', 
            width: '100%', 
            height: '60vh' // Centrado vertical relativo al contenido
        }}>
            <Box sx={{ width: '80%', maxWidth: 400 }}>
                <LinearProgress />
                <Typography variant="body2" sx={{ mt: 2, textAlign: 'center', color: 'text.secondary' }}>
                    Cargando ChronoMED...
                </Typography>
            </Box>
        </Box>
    );
}
//------------------------------------------------------------------------------
export const CounterWidget = ({icon, bgClass, category, title, bgImage}) => {
    return (
        <Card
            className={bgClass}
            sx={{
                //backgroundImage: `url(${getSVGURI(icon,'#ffffff10')})`,
                backgroundImage: `url("${bgImage}") !important`,
                backgroundSize: 'cover',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'bottom right',
            }}
        >
            <CardContent>
                <Grid
                    container
                    spacing={1}
                    direction="row"
                    sx={{
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Grid size={{ xs: 6, lg: 3 }}>
                        <FontAwesomeIcon
                            icon={icon}
                            size="3x"
                        />
                    </Grid>
                    <Grid size={{ xs: 6, lg: 9 }}  >
                        <h5 className="widget">{category}</h5>
                        <h3 className="widget">{title}</h3>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
};
//------------------------------------------------------------------------------
export const CircleChartWidget = ({title, chartData, containerHeight, icon}) => {
    return (
        <Card
            border="light"
            sx={{
                backgroundImage: `url(${getSVGURI(icon,'#00000010')})`,
                backgroundSize: 'auto 50%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '95% 95%',
            }}
        >
            <CardContent sx={{ height: containerHeight }}>
                <Typography>{title}</Typography>
                <PieChart
                    series={[
                        {
                            data: chartData,
                            innerRadius: 60,
                            outerRadius: 100,
                            highlightScope: { fade: 'global', highlight: 'item' },
                            faded: { innerRadius: 40, additionalRadius: -20, color: 'gray' },
                        }
                    ]}
                    margin={{ top: 0, bottom: 0, left: 0, right:0 }}
                    slotProps={{
                        legend: {
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'middle' },
                            padding: 0,
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
};
//------------------------------------------------------------------------------
export const StackedBarChartWidget = ({title, chartData, chartLabels, containerHeight, icon, dataKeyPropName}) => {
    const [highlighted, setHighlighted] = React.useState('item');
    const [faded, setFaded] = React.useState('global');

    return (
        <Card
            border="light"
            sx={{
                backgroundImage: `url(${getSVGURI(icon,'#00000010')})`,
                backgroundSize: 'auto 50%',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: '95% 95%',
            }}
        >
            <CardContent sx={{ height: containerHeight }}>
                <Typography>{title}</Typography>
                <BarChart
                    dataset={chartData}
                    series={chartLabels.map((series) => ({
                        ...series,
                        highlightScope: {
                            highlighted,
                            faded,
                        },
                    }))}
                    xAxis={[{ scaleType: 'band', dataKey: dataKeyPropName, /* tickLabelStyle: { angle: -90, textAnchor: 'end' },  */ }]}
                    /*
                    * https://github.com/mui/mui-x/issues/10463
                    * sx? -> [`.${axisClasses.bottom} .${axisClasses.tickLabel}`]: {transform: 'rotateZ(-45deg)',},
                    *
                    * */
                    grid={{ horizontal: true }}
                    slotProps={{
                        legend: {
                            direction: 'row',
                            position: { vertical: 'bottom', horizontal: 'middle' },
                            padding: 0,
                        },
                    }}
                />
            </CardContent>
        </Card>
    );
};
