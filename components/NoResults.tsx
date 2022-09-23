import React from "react";
import { NextPage } from "next";

interface Props {
  text: string;
}

const NoResults: NextPage<Props> = ({ text }) => {
  return <div>NoResults</div>;
};

export default NoResults;
