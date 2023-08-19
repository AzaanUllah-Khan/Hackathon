import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-analytics.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, query, where, getDocs, serverTimestamp, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import { getDownloadURL, getStorage, ref } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyAAvCtrHrZ9Axf00FsbV55pWhAdIhxgHnQ",
    authDomain: "hackathon-39d98.firebaseapp.com",
    projectId: "hackathon-39d98",
    storageBucket: "hackathon-39d98.appspot.com",
    messagingSenderId: "712651049178",
    appId: "1:712651049178:web:ef9d4e7218e29a55327de3",
    measurementId: "G-PZVZ8N3ZE9"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth();
var storage = getStorage()
var currentUser;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.replace('../../index.html')
    }
    else {
        const btn = document.getElementById('publish');
        btn.addEventListener('click', async () => {
            var title = document.getElementById("title").value
            var desc = document.getElementById("description").value
            if (title.length >= 5 && title.length <= 50 && desc.length >= 100 && desc.length <= 3000) {
                try {
                    const docRef = await addDoc(collection(db, "blogs"), {
                        timeOfPost: serverTimestamp(),
                        title,
                        description: desc,
                        email: user.email,
                        name: currentUser
                    });
                    Swal.fire({
                        text: 'Post Added Successful',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    }).then(() => {
                        location.reload()
                    });
                } catch (e) {
                    console.error("Error adding document: ", e);
                }
            }
            else {
                Swal.fire({
                    text: 'Post Title should be b/w 5 to 50 character and description should be b/w 100 to 3000 characters',
                    icon: 'error',
                    confirmButtonText: 'OK'
                })
            }
        });
        async function getYourName() {
            const querySnapshot = await getDocs(collection(db, "users"));
            querySnapshot.forEach(async (doc) => {
                if (doc.id == user.uid) {
                    console.log(doc.data());
                    currentUser = doc.data().fname;

                    const q = query(collection(db, "blogs"), where("email", "==", user.email));
                    const querySnapshot = await getDocs(q);

                    var container = document.getElementById("container");

                    if (querySnapshot.size === 0) {
                        container.innerHTML += `
                            <div class="container" style="width: 100%; padding: 0; margin: 0">
                                <div class="container-fluid" style="width: 100%; padding: 0; margin: 0">
                                    <div class="row" style="width: 100%; padding: 0; margin: 0">
                                        <div class="col-md-12 border border-1 bg-body rounded">
                                            <div class="blog p-3">
                                                <div class="profile d-flex">
                                                    <div class="userbox ms-4">
                                                        <h3 id="blog-title" style="font-size: 18px">No posts yet</h3>
                                                        <p class="fw-bold text-muted">${(doc.data().name) || "User"} - August 16th, 2023</p>
                                                    </div>
                                                </div>
                                                <br>
                                                <div class="description">
                                                    <p class="text-muted">Start sharing your thoughts!</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <br>
                                </div>
                            </div>
                        `;
                    } else {
                        querySnapshot.forEach((doc) => {
                            getDownloadURL(ref(storage, doc.data().email))
                                .then((url) => {
                                    document.getElementById("container").innerHTML += `<div class="container" style="width: 100%; padding: 0; margin: 0">
                          <div class="container-fluid" style="width: 100%; padding: 0; margin: 0">
                              <div class="row" style="width: 100%; padding: 0; margin: 0">
                                  <div class="col-md-12 border border-1 bg-body rounded">
                                      <div class="blog p-3">
                                          <div class="profile d-flex">
                                              <div class="imgbox">
                                                  <img src="${url}" class="rounded"
                                                      height="110px" width="110px" onclick="goTo('${doc.data().email}')" style="object-fit: cover">
                                              </div>
                                              <div class="userbox ms-4">
                                                  <h3 id="blog-title">${doc.data().title}</h3>
                                                  <p class="fw-bold text-muted">${(doc.data().name) || "User"} - ${doc.data().timeOfPost ? moment(doc.data().timeOfPost.toDate()).fromNow():moment().fromNow()}</p>
                                              </div>
                                          </div>
                                          <br>
                                          <div class="description">
                                              <p class="text-muted" style="word-break: break-all">${doc.data().description}</p>
                                          </div>
                                          <div style="display: flex; align-items: center; gap: 20px">
                                          <a onclick="edit('${doc.id}')" style="color: #7749F8; cursor: pointer">Edit</a>
                                          <a onclick="del('${doc.id}')" style="color: #7749F8; cursor: pointer">Delete</a>
                                          </div>
                                      </div>
                                  </div>
                              </div>
                              <br>
                          </div>
                          <br>
                        </div>`
                                })
                                console.log(doc.data().timeOfPost);
                        });
                    }
                }
            });
            document.getElementById("username").innerHTML = currentUser;
        }

        getYourName()
        console.log(currentUser);
    }
});
const logout = document.getElementById('lO')
logout.addEventListener('click', () => {
    Swal.fire({
        title: 'Are you sure you want to LogOut?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1ca1f1',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Logout!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            signOut(auth).then(() => {
                Swal.fire(
                    'Logout!',
                    'User has successfully logged out.',
                    'success'
                ).then(() => {
                    location.replace("../../index.html")
                })
            }).catch((error) => {
            });
        }
    })
})


async function del(toDel) {
    Swal.fire({
        title: 'Are you sure you want to Delete',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1ca1f1',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Delete!'
    }).then(async (result) => {
        if (result.isConfirmed) {
            await deleteDoc(doc(db, "blogs", toDel)).then(() => {
                location.reload()
            })
        }
    }).catch((error) => {
    });
}
window.del = del

function edit(id) {
    const azaan = doc(db, "blogs", id);

    Swal.fire({
        title: `Enter Values to Replace`,
        html:
            `<input id="title" class="swal2-input" placeholder="Enter new title" type="text" required>
            <input id="description" class="swal2-input" placeholder="Enter new description" type="text" required>`,
        confirmButtonText: 'Replace / Edit !',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            const titleValue = Swal.getPopup().querySelector('#title').value;
            const descriptionValue = Swal.getPopup().querySelector('#description').value;
            return { titleValue, descriptionValue };
        }
    }).then(async (result) => {
        if (result.isConfirmed) {
            await updateDoc(azaan, {
                title: result.value.titleValue,
                description: result.value.descriptionValue + " (edited on " + new Date().getHours() + ":" + new Date().getMinutes() + ")"
            });
            Swal.fire({
                title: `Values Replaced`,
                icon: 'success'
            }).then(() => {
                location.reload();
            });
        }
    });
}

window.edit = edit;

onAuthStateChanged(auth, async (user) => {
    if (!user) {
        location.replace("../../index.html")
    }
})