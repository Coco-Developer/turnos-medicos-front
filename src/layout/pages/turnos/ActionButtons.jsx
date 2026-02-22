import React from "react";
import { Box, Button } from "@mui/material";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import {useNavigate} from "react-router-dom";
import {DATE_FORMAT} from "../../libs/constants";

export const ActionButtons = ({fecha}) => {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: 'flex', gap: '1rem', p: '4px' }}>
            <Button
                id="agregar"
                color="primary"
                variant="contained"
                onClick={() => navigate('/turnos/form?f=' + fecha.format(DATE_FORMAT))}
                startIcon={<FontAwesomeIcon icon={faCirclePlus} />}
            >
                Añadir
            </Button>
        </Box>
    );
};