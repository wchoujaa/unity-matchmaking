# Importing required modules

import matplotlib.pyplot as plt
import seaborn as sns; sns.set()  # for plot styling
import numpy as np
from sklearn.cluster import KMeans
 
import matplotlib.pyplot as plt
from sklearn.datasets import make_blobs


n_samples = 300
X, y_true = make_blobs(n_samples=n_samples, centers=4,
                       cluster_std=0.60, random_state=0)


K = 3
# Initialize the class object


n_clusters = int(n_samples / K)

print("Number of clusters " + str(n_clusters))
kmeans = KMeans(n_clusters=n_clusters)

kmeans.fit(X)
y_kmeans = kmeans.predict(X)



plt.scatter(X[:, 0], X[:, 1], c=y_kmeans, s=50, cmap='viridis')

centers = kmeans.cluster_centers_
plt.scatter(centers[:, 0], centers[:, 1], c='black', s=200, alpha=0.5) 
plt.show()