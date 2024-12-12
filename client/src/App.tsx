import { useState, useEffect } from "react";
import {Client} from './models/client';
import {getToken} from './token';
import { DataGrid,GridCellParams } from "@mui/x-data-grid";
import { Paper } from "@mui/material";
import {IconButton, Box, Tooltip, Typography, TextField, Dialog, DialogActions, DialogContent, DialogTitle} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import './App.css'

function App() {

  const [clients, setClients] = useState<Client[]>([]);
  const [clientsFiltered, setClientsFiltered] = useState<Client[]>([]);
  const [clientSelected, setClientSelected] = useState<Client>(new Client('','',''));
  const [textSearch, setTextSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [titleDialog, setTitleDialog] = useState('');
  const [isReadOnlyDialog, setIsReadOnlyDialog] = useState(true);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    LoadClients();
  },[]);

  const LoadClients = async () => {    
    try {
      
      setLoading(true);
      
      const token = await getToken();
      const endpoint = "http://localhost:3000/clients/getAll";
      const response = await fetch(endpoint,{
        method: "GET",
        headers:{
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await response.json();
      
      setClients(data);
      setClientsFiltered(data);
      
      localStorage.setItem("clients", JSON.stringify([]));
    }
    catch(err) {
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  const AddClientStorage = (client:Client) => {    
    const clientsStorage = localStorage.getItem("clients");
      if (clientsStorage) {
        const arrayClientsStorage = JSON.parse(clientsStorage);
        arrayClientsStorage.push(client);
      }
  };

  const SaveClient = async (event: React.FormEvent) => {    
    try 
    {
      setLoading(true);
      event.preventDefault();
      setOpenDialog(false);
      const token = await getToken();
      const endpoint = "http://localhost:3000/clients/add";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(clientSelected),
      });
      if(response.ok)
      {
        setTextSearch('');
        const newClient = await response.json();
        clients.push(newClient);
        setClientsFiltered(clients);

        AddClientStorage(newClient);
      }
      else 
      {
        const errorHolder = await response.json();
        console.log(errorHolder);
      }
    }
    catch(err) {
      console.error(err);
    }
    finally {
      setLoading(false);
    }
  };

  const FilterClients = (event:React.ChangeEvent<HTMLInputElement>) => {
    setTextSearch(event.target.value);
    const query = event.target.value.toLowerCase();
    const data = clients.filter((client:Client) => 
      client.Name.toLowerCase().includes(query) || client.Mobile.toString().includes(query) || client.Email.toString().includes(query)
    || client.Address.toString().includes(query) || client.Country.toString().includes(query) || client.Province.toString().includes(query)
    || client.Locality.toString().includes(query)
    || client.Observations.toString().includes(query)
    );

    setClientsFiltered(data);
  };

  const RemoveClient = (id:number) => {    

    const clientToDelete = clients.find((client:Client) => {
      return client.ClientId === id;
    })

    const clientsNotDeleted = clients.filter((client:Client) => client.ClientId !== id);
    setClients(clientsNotDeleted);

    const clientsFilteredNotDeleted = clientsFiltered.filter((client) => client.ClientId !== id);
    setClientsFiltered(clientsFilteredNotDeleted);
    
    if(clientToDelete) AddClientStorage(clientToDelete);
  };

  const ViewDetailsClient = (id:number) => {  

    setOpenDialog(true);
    setTitleDialog('Detalles Cliente');
    setIsReadOnlyDialog(true);
    const clientViewDetails = clientsFiltered.filter((client:Client) => client.ClientId == id);
    setClientSelected(clientViewDetails[0]);    
  };

  const AddClient = () => {    
    setOpenDialog(true);
    setTitleDialog('Nuevo Cliente');
    setIsReadOnlyDialog(false);
    setClientSelected(new Client('','',''));
  };

  const CancelDialog = () => {    
    setOpenDialog(false);
  };

  const columns = [
    { field: 'ClientId', headerName: 'ID', minWidth: 50, flex: 0.3},
    { field: 'Name', headerName: 'Nombre', minWidth: 200, flex: 1},
    { field: 'Mobile', headerName: 'Móvil', minWidth: 200, flex: 1},
    { field: 'Email', headerName: 'Email', minWidth: 200, flex: 1},    
    {
      field: 'Acciones',
      headerName: '',
      minWidth: 100, flex: 0.6,
      renderCell: (params:GridCellParams) => {
        return (
          <div style={{display: 'inline' }}>
          <Tooltip title="Ver Detalles" arrow>
          <IconButton
            color="primary"
            onClick={() => ViewDetailsClient(Number(params.id))}
            aria-label="Ver Detalles"
          >
            <VisibilityIcon  />
          </IconButton>
          </Tooltip> | 
          <Tooltip title="Eliminar" arrow>
          <IconButton
            color="error"
            onClick={() => RemoveClient(Number(params.id))}
            aria-label="Eliminar"
          >
            <DeleteIcon />
          </IconButton>
          </Tooltip>
          </div>
          
        );
      },
    },
  ];

  const data = {
    rows: clientsFiltered.map(client => ({
      id: client.ClientId,
      ...client,
    })),
    columns: columns
  };
    
  return (
    <div style={{ height: 400, width: '100%', display: 'block' }}> 
      {loading && (<div>Loading...</div>)}
      {!loading && (<div>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
      <Box flex={1} mr={2}>
      <Typography variant="h5" component="div" gutterBottom>
        Listado de Clientes
      </Typography>
      </Box>
        <Box>
          <Tooltip title="Nuevo Cliente" arrow>
            <IconButton 
              color="primary" 
              onClick={AddClient}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Restaurar" arrow>
            <IconButton 
              color="primary"
              onClick={LoadClients}
            >
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
        <TextField
        label="Buscar"
        variant="outlined"
        value={textSearch}
        onChange={FilterClients}
        fullWidth
        style={{ marginBottom: '20px' }}
      />
      <Paper>
      <DataGrid 
        {...data}
        initialState={{
          pagination: {
            paginationModel: { pageSize: 5, page: 0 },
          },
        }}
        pageSizeOptions={[5, 10, 25, { value: -1, label: 'All' }]}/>      
      </Paper>
      <Dialog open={openDialog} onClose={CancelDialog}>
        <DialogTitle>{titleDialog}</DialogTitle>
        <form onSubmit={SaveClient}>
        <DialogContent>
            <TextField
              autoFocus
              label="Nombre"
              fullWidth
              variant="outlined"
              value={clientSelected.Name}
              onChange={(e) => setClientSelected({...clientSelected, Name:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 45 } }}
              required
            />
            <TextField
              label="Móvil"
              fullWidth
              variant="outlined"
              value={clientSelected.Mobile}
              onChange={(e) => setClientSelected({...clientSelected, Mobile:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 9 } }}
              required
            />            
            <TextField
              label="Correo Electrónico"
              fullWidth
              variant="outlined"
              value={clientSelected.Email}
              onChange={(e) => setClientSelected({...clientSelected, Email:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 45 } }}
              type="email"
              required
            />
            <TextField
              label="Dirección"
              fullWidth
              variant="outlined"
              value={clientSelected.Address}
              onChange={(e) => setClientSelected({...clientSelected, Address:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 45 } }}
            />
            <TextField
              label="País"
              fullWidth
              variant="outlined"
              value={clientSelected.Country}
              onChange={(e) => setClientSelected({...clientSelected, Country:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 45 } }}
            />
            <TextField
              label="Localidad"
              fullWidth
              variant="outlined"
              value={clientSelected.Locality}
              onChange={(e) => setClientSelected({...clientSelected, Locality:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 45 } }}
            />
            <TextField
              label="Observaciones"
              fullWidth
              multiline
              variant="outlined"
              value={clientSelected.Observations}
              onChange={(e) => setClientSelected({...clientSelected, Observations:e.target.value})}
              disabled={isReadOnlyDialog}
              slotProps={{ htmlInput: { maxLength: 2000} }}
            />
        </DialogContent>
        <DialogActions>
        {!isReadOnlyDialog && (
          <Tooltip title="Guardar">
            <IconButton color="primary" type="submit">
              <SaveIcon />
            </IconButton>
          </Tooltip>
          )}
          <Tooltip title="Cancelar">
            <IconButton onClick={CancelDialog} color="secondary">
              <CancelIcon />
            </IconButton>
          </Tooltip>
        </DialogActions>
        </form>
      </Dialog>
      </div>)}
    </div>
  )
}

export default App
