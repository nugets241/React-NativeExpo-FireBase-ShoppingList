// components/ShoppingList.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';

export default function ShoppingList({ route }) {
  const { listId,updateItemCount } = route.params;  // Retrieve listId from navigation params
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [items, setItems] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, `shoppingLists/${listId}/items`), snapshot => {
      const shoppingItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(shoppingItems);
      updateItemCount(listId, shoppingItems.length);
    });
    return () => unsubscribe();
  }, [listId,updateItemCount]);

  const addItem = async () => {
    if (itemName && quantity && unit) {
      await addDoc(collection(db, `shoppingLists/${listId}/items`), {
        name: itemName,
        quantity: parseInt(quantity),
        unit,
      });
      setItemName('');
      setQuantity('');
      setUnit('');
      setIsModalVisible(false);
    }
  };

  const deleteItem = async (id) => {
    await deleteDoc(doc(db, `shoppingLists/${listId}/items`, id));
  };

  const updateItem = async () => {
    if (itemName && quantity && unit) {
      await updateDoc(doc(db, `shoppingLists/${listId}/items`, editingItemId), {
        name: itemName,
        quantity: parseInt(quantity),
        unit,
      });
      setItemName('');
      setQuantity('');
      setUnit('');
      setEditingItemId(null);
      setIsModalVisible(false);
    }
  };

  const editItem = (item) => {
    setItemName(item.name);
    setQuantity(item.quantity.toString());
    setUnit(item.unit);
    setEditingItemId(item.id);
    setIsModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Items in {route.params.listName}</Text>
      <Button title="+ Add Item" onPress={() => setIsModalVisible(true)} />

      <FlatList
        data={items}
        renderItem={({ item }) => (
          <View style={styles.itemContainer}>
            <Text style={styles.itemText}>
              {item.name} - {item.quantity} {item.unit}
            </Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity onPress={() => editItem(item)} style={styles.editButton}>
                <Text>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.deleteButton}>
                <Text>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      <Modal visible={isModalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <TextInput
            placeholder="Item Name"
            value={itemName}
            onChangeText={setItemName}
            style={styles.input}
          />
          <TextInput
            placeholder="Quantity"
            value={quantity}
            keyboardType="numeric"
            onChangeText={setQuantity}
            style={styles.input}
          />
          <TextInput
            placeholder="Unit"
            value={unit}
            onChangeText={setUnit}
            style={styles.input}
          />
          <Button title={editingItemId ? "Update Item" : "Add Item"} onPress={editingItemId ? updateItem : addItem} />
          <Button title="Cancel" onPress={() => setIsModalVisible(false)} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemText: {
    fontSize: 18,
  },
  buttonsContainer: {
    flexDirection: 'row',
  },
  editButton: {
    marginRight: 10,
    padding: 10,
    backgroundColor: 'yellow',
  },
  deleteButton: {
    padding: 10,
    backgroundColor: 'red',
  },
  modalContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  input: {
    borderWidth: 1,
    padding: 10,
    marginBottom: 20,
  },
});
