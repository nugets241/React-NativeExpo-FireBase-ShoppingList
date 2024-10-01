
// App.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Modal, TextInput, TouchableOpacity, Alert, Share } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import ShoppingList from './components/ShoppingList'; // Individual shopping list component
import { db } from './firebase';
import { collection, addDoc, onSnapshot,getDocs,deleteDoc,doc,updateDoc } from 'firebase/firestore';
import { registerRootComponent } from 'expo';
import Icon from 'react-native-vector-icons/MaterialIcons'; // Importing Icons


const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const [lists, setLists] = useState([]);
  const [isNewListModalVisible, setIsNewListModalVisible] = useState(false); // For new list creation
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false); // For list settings
  const [newListName, setNewListName] = useState('');
  const [editingListId, setEditingListId] = useState(null);
  const [selectedList, setSelectedList] = useState(null); // To track the selected list for settings

  // Function to update item count
  const updateItemCount = (listId, itemCount) => {
    setLists((prevLists) =>
      prevLists.map((list) =>
        list.id === listId ? { ...list, itemsCount: itemCount } : list
      )
    );
  };
//---------________________------------------------------

  useEffect(() => {
    // Subscribe to Firestore changes
    const unsubscribe = onSnapshot(collection(db, 'shoppingLists'), async snapshot => {
      const shoppingLists = await fetchShoppingLists(snapshot);
      setLists(shoppingLists);
    });
    return () => unsubscribe();
  }, []);

  // Function to fetch shopping lists and their item counts
  const fetchShoppingLists = async (snapshot) => {
    const shoppingLists = await Promise.all(snapshot.docs.map(async doc => {
      const itemsCount = await getItemCount(doc.id); // Get item count for the current list
      return {
        id: doc.id,
        name: doc.data().name,
        itemsCount // Include item count
      };
    }));
    return shoppingLists;
  };

  // Function to get the item count for a specific shopping list
  const getItemCount = async (listId) => {
    try {
      const itemsSnapshot = await getDocs(collection(db, `shoppingLists/${listId}/items`));
      return itemsSnapshot.docs.length; // Return the count of items
    } catch (error) {
      console.error("Error fetching items:", error);
      return 0; // Return 0 if there's an error
    }
  };

//----------------------------------------_______-------------------------
const createNewList = async () => {
  if (newListName.trim() !== '') {
    if (editingListId) {
      await updateDoc(doc(db, 'shoppingLists', editingListId), { name: newListName });
      setEditingListId(null);
    } else {
      await addDoc(collection(db, 'shoppingLists'), { name: newListName });
    }
    setNewListName('');
    setIsNewListModalVisible(false); // Close new list modal
  }
};

const deleteList = async (listId) => {
  try {
    const itemsSnapshot = await getDocs(collection(db, `shoppingLists/${listId}/items`));

    // Delete items from the list individually (since batch is not being used)
    for (const item of itemsSnapshot.docs) {
      await deleteDoc(doc(db, `shoppingLists/${listId}/items`, item.id));
    }

    // Now delete the list itself
    await deleteDoc(doc(db, 'shoppingLists', listId));
  } catch (error) {
    console.error("Error deleting list:", error);
  }
};


const shareList = async () => {
  Alert.alert('Feature Coming Soon', 'This feature will be implemented in a future update.');
};


const promptDeleteList = (listId) => {
  Alert.alert(
    'Delete List',
    'Are you sure you want to delete this list?',
    [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', onPress: () => deleteList(listId) },
    ],
    { cancelable: true }
  );
};

const renameList = (listId, currentName) => {
  setNewListName(currentName);
  setEditingListId(listId);
  setIsNewListModalVisible(true); // Use the same modal for renaming and creating
};

const openSettingsMenu = (list) => {
  setSelectedList(list); // Store selected list
  setIsSettingsModalVisible(true); // Open settings modal
};

const openNewListModal = () => {
  setNewListName('');  // Clear the input field
  setEditingListId(null);  // Reset renaming state
  setIsNewListModalVisible(true);  // Open the new list modal
};
const closeNewListModal = () => {
  setNewListName('');  // Clear the input field
  setEditingListId(null);  // Reset renaming state
  setIsNewListModalVisible(false);  // Close the modal
};

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Shopping Lists</Text>
      {/* <Button title="+ New List" onPress={() => setIsNewListModalVisible(true)} /> */}
      <Button title="+ New List" onPress={openNewListModal} />

      <FlatList
        data={lists}
        renderItem={({ item }) => (
          <View style={styles.listItemContainer}>
            <TouchableOpacity
              style={styles.listItem}
              onPress={() => navigation.navigate('ShoppingList', { listId: item.id, listName: item.name,updateItemCount })}
            >
              <Text style={styles.listItemText}>{item.name}</Text>
              <Text style={styles.itemCountText}>Items: {item.itemsCount || 0}</Text>
            </TouchableOpacity>

            {/* Settings Icon */}
            <TouchableOpacity onPress={() => openSettingsMenu(item)}>
              <Icon name="settings" size={24} color="gray" />
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={item => item.id}
      />

      {/* Modal for Creating or Renaming a List */}
      <Modal visible={isNewListModalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TextInput
              placeholder={editingListId ? 'Rename List' : 'New List Name'}
              value={newListName}
              onChangeText={setNewListName}
              style={styles.input}
            />
            <Button
              title={editingListId ? 'Rename' : 'Create'}
              onPress={createNewList}
            />
            <Button title="Close" onPress={closeNewListModal} />
            {/* <Button title="Close" onPress={() => setIsNewListModalVisible(false)} /> */}
          </View>
        </View>
      </Modal>

      {/* Modal for Settings Options */}
      {selectedList && (
        <Modal visible={isSettingsModalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Settings for {selectedList.name}</Text>

              {/* Rename Option */}
              <TouchableOpacity
                onPress={() => {
                  setIsSettingsModalVisible(false); // Close settings modal
                  renameList(selectedList.id, selectedList.name); // Open rename modal
                }}
                style={styles.modalButton}
              >
                <Icon name="edit" size={20} color="black" />
                <Text>Rename</Text>
              </TouchableOpacity>

              {/* Delete Option */}
              <TouchableOpacity
                onPress={() => {
                  setIsSettingsModalVisible(false); // Close settings modal
                  promptDeleteList(selectedList.id); // Prompt for delete
                }}
                style={styles.modalButton}
              >
                <Icon name="delete" size={20} color="red" />
                <Text>Delete</Text>
              </TouchableOpacity>

              {/* Share Option */}
              <TouchableOpacity
                onPress={() => {
                  setIsSettingsModalVisible(false); // Close settings modal
                  shareList(selectedList.id, selectedList.name); // Share list
                }}
                style={styles.modalButton}
              >
                <Icon name="share" size={20} color="blue" />
                <Text>Share</Text>
              </TouchableOpacity>
              <Button title="Close" onPress={() => setIsSettingsModalVisible(false)} />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Shopping Lists' }} />
        <Stack.Screen
          name="ShoppingList"
          component={ShoppingList}
          options={({ route }) => ({ title: route.params.listName })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

registerRootComponent(App);

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
  },
  heading: {
    fontSize: 24,
    marginBottom: 20,
  },
  listItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 10,
    borderRadius: 5,
  },
  listItem: {
    flex: 1,
  },
  listItemText: {
    fontSize: 18,
  },
  itemCountText: {
    fontSize: 14,
    color: '#555',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    marginVertical: 10,
  },
  input: {
    borderBottomWidth: 1,
    marginBottom: 20,
    padding: 5,
  },
});
export default App;
//-------------------------------------------------
