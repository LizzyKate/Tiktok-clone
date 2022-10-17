import { useRouter } from "next/router";
import React, { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import axios from "axios";
import useAuthStore from "../store/auth";
import { client } from "../utils/client";
import { SanityAssetDocument } from "@sanity/client";
import { topics } from "../utils/constants";
import { BASE_URL } from "../utils";

const Upload = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [videoAsset, setVideoAsset] = useState<
    SanityAssetDocument | undefined
  >();
  const [wrongFileType, setWrongFileType] = useState<boolean>(false);
  const [caption, setCaption] = useState<string>("");
  const [category, setCategory] = useState<string>(topics[0].name);
  const [savingPost, setSavingPost] = useState<boolean>(false);

  const { userProfile }: { userProfile: any } = useAuthStore();

  const router = useRouter();

  const uploadVideo = async (e: any) => {
    const file = e.target.files[0];
    const fileType = ["video/mp4", "video/webm", "video/ogg", "video/wmv"];

    if (fileType.includes(file.type)) {
      client.assets
        .upload("file", file, {
          contentType: file.type,
          filename: file.name,
        })
        .then((asset) => {
          setVideoAsset(asset);
          setIsLoading(false);
          setWrongFileType(false);
        });
    } else {
      setIsLoading(false);
      setWrongFileType(true);
    }
  };
  const handlePost = async () => {
    if (caption && videoAsset?._id && category) {
      setSavingPost(true);

      const doc = {
        _type: "post",
        caption,
        video: {
          _type: "file",
          asset: {
            _type: "reference",
            _ref: videoAsset?._id,
          },
        },
        userId: userProfile?._id,
        postedBy: {
          _type: "postedBy",
          _ref: userProfile?._id,
        },
        topic: category,
      };

      await axios.post(`${BASE_URL}/api/post`, doc);
      router.push("/");
    }
  };

  return (
    <div className="flex w-full h-full absolute left-0 top-[60px] lg:top-[70px] mb-10 pt-10 lg:pt-20 bg-[#F8F8F8] justify-center">
      <div className=" bg-white rounded-lg xl:h-[80vh]  flex gap-6 flex-wrap justify-center items-center p-14 pt-6">
        <div>
          <div>
            <p className="text-2xl font-bold">Upload Video</p>
            <p className="text-md text-gray-400 mt-1">
              Post a video to your account
            </p>
          </div>
          <div className="border-dashed rounded-xl border-4 border-gray-200 flex flex-col justify-center items-center outline-none mt-10 w-[260px] h-[460px] p-10 cursor-pointer hover:border-red-300 hover:bg-gray-100">
            {isLoading ? (
              <p>Uploading...</p>
            ) : (
              <div>
                {videoAsset ? (
                  <div>
                    {videoAsset ? (
                      <div>
                        <video
                          src={videoAsset.url}
                          loop
                          controls
                          className="rounded-xl h-[450px] mt-16 bg-black"
                        ></video>
                      </div>
                    ) : (
                      <div></div>
                    )}
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="flex flex-col items-center justify-center h-full">
                      <div className="flex flex-col items-center justify-center">
                        <p className="font-bold text-xl ">
                          <FaCloudUploadAlt className="text-gray-300 text-6xl" />
                        </p>
                        <p className="text-xl font-semibold">Upload Video </p>
                      </div>
                      <p className="text-gray-400 text-center mt-10 text-sm leading-10">
                        MP4 or WebM or ogg
                        <br /> 720x1280 or higher
                        <br />
                        Up to 10 minutes
                        <br />
                        Less than 2gb
                      </p>
                      <p className="bg-[#F51997] text-center mt-10 rounded text-white text-md font-medium p-2 w-52 outline-none">
                        Select File
                      </p>
                      <input
                        type="file"
                        name="upload-video"
                        className="w-0 h-0"
                        onChange={uploadVideo}
                      />
                    </div>
                  </label>
                )}
              </div>
            )}
            {wrongFileType && (
              <p className="text-center text-xl text-red-400 font-semibold mt-4 w-[250px] ">
                Please select a video type
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-3 pb-10">
          <label className="text-md font-medium ">Caption</label>
          <input
            type="text"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
            }}
            className="rounded outline-none text-md border border-gray-200 p-2"
          />
          <label className="text-md font-medium ">Choose a category</label>
          <select
            onChange={(e) => {
              setCategory(e.target.value);
            }}
            className="outline-none lg:w-650 border-2 border-gray-200 text-md capitalize lg:p-4 p-2 rounded cursor-pointer"
          >
            {topics.map((item) => (
              <option
                key={item.name}
                className=" outline-none capitalize bg-white text-gray-700 text-md p-2 hover:bg-slate-300"
                value={item.name}
              >
                {item.name}
              </option>
            ))}
          </select>
          <div className="flex gap-6 mt-10">
            <button
              type="button"
              className="border-gray-300 border-2 text-md font-medium p-2 rounded w-28 lg:w-44 outline-none"
            >
              Discard
            </button>
            <button
              disabled={videoAsset?.url ? false : true}
              onClick={handlePost}
              type="button"
              className="bg-[#F51997] text-white text-md font-medium p-2 rounded w-28 lg:w-44 outline-none"
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Upload;
