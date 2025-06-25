import { fetchItems, addItem, updateItem, removeItem } from '../models/index.js';

export const getItems = async (req, res) => {
    try {
        const items = await fetchItems();
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching items', error });
    }
};

export const createItem = async (req, res) => {
    try {
        const newItem = await addItem(req.body);
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: 'Error creating item', error });
    }
};

export const updateItem = async (req, res) => {
    try {
        const updatedItem = await updateItem(req.params.id, req.body);
        res.status(200).json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: 'Error updating item', error });
    }
};

export const deleteItem = async (req, res) => {
    try {
        await removeItem(req.params.id);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting item', error });
    }
};